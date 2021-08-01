// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import {
  ConfigFolderName,
  err,
  FxError,
  Inputs,
  ok,
  PluginConfig,
  ProjectSettings,
  Result,
  SolutionConfig,
  SolutionContext,
  Stage,
  StaticPlatforms,
  Tools,
} from "@microsoft/teamsfx-api";
import { CoreHookContext, FxCore, objectToMap } from "../..";
import {
  InvalidProjectError,
  NoProjectOpenedError,
  PathNotExistError,
  ReadFileError,
} from "../error";
import * as path from "path";
import * as fs from "fs-extra";
import { Middleware, NextFunction } from "@feathersjs/hooks/lib";
import { validateProject } from "../../common";
import * as uuid from "uuid";
import { LocalCrypto } from "../crypto";
import { PluginNames } from "../../plugins/solution/fx-solution/constants";
import { environmentManager } from "../environment";

export const ContextLoaderMW: Middleware = async (ctx: CoreHookContext, next: NextFunction) => {
  const inputs = ctx.arguments[ctx.arguments.length - 1] as Inputs;
  const method = ctx.method;
  let isCreate = false;
  if (method === "getQuestions") {
    const task = ctx.arguments[0] as Stage;
    isCreate = task === Stage.create;
  }
  const ignoreLoad =
    inputs.ignoreTypeCheck === true || StaticPlatforms.includes(inputs.platform) || isCreate;
  if (!ignoreLoad) {
    if (!inputs.projectPath) {
      ctx.result = err(NoProjectOpenedError());
      return;
    }
    const projectPathExist = await fs.pathExists(inputs.projectPath);
    if (!projectPathExist) {
      ctx.result = err(PathNotExistError(inputs.projectPath));
      return;
    }
    const core = ctx.self as FxCore;
    const loadRes = await loadSolutionContext(core.tools, inputs);
    if (loadRes.isErr()) {
      ctx.result = err(loadRes.error);
      return;
    }
    const validRes = validateProject(loadRes.value);
    if (validRes) {
      ctx.result = err(InvalidProjectError(validRes));
      return;
    }
    ctx.solutionContext = loadRes.value;
  }
  await next();
};

export async function loadSolutionContext(
  tools: Tools,
  inputs: Inputs
): Promise<Result<SolutionContext, FxError>> {
  try {
    if (!inputs.projectPath) {
      return err(NoProjectOpenedError());
    }

    const confFolderPath = path.resolve(inputs.projectPath, `.${ConfigFolderName}`);
    const settingsFile = path.resolve(confFolderPath, "settings.json");
    const projectSettings: ProjectSettings = await fs.readJson(settingsFile);
    let projectIdMissing = false;
    if (!projectSettings.currentEnv) projectSettings.currentEnv = "default";
    if (!projectSettings.projectId) {
      projectSettings.projectId = uuid.v4();
      projectIdMissing = true;
    }
    if (
      projectSettings.solutionSettings &&
      projectSettings.solutionSettings.activeResourcePlugins &&
      !projectSettings.solutionSettings.activeResourcePlugins.includes(PluginNames.APPST)
    ) {
      projectSettings.solutionSettings.activeResourcePlugins.push(PluginNames.APPST);
    }

    const cryptoProvider = new LocalCrypto(projectSettings.projectId);
    // ensure backwards compatibility:
    // no need to decrypt the secrets in *.userdata for previous TeamsFx project, which has no project id.
    const envDataResult = await environmentManager.loadEnvProfile(
      inputs.projectPath,
      inputs.targetEnvName,
      projectIdMissing ? undefined : cryptoProvider
    );
    if (envDataResult.isErr()) {
      return err(envDataResult.error);
    }
    const envInfo = envDataResult.value;

    const solutionContext: SolutionContext = {
      projectSettings: projectSettings,
      targetEnvName: envInfo.envName,
      config: envInfo.data,
      root: inputs.projectPath || "",
      ...tools,
      ...tools.tokenProvider,
      answers: inputs,
      cryptoProvider: cryptoProvider,
    };
    return ok(solutionContext);
  } catch (e) {
    return err(ReadFileError(e));
  }
}

export async function newSolutionContext(tools: Tools, inputs: Inputs): Promise<SolutionContext> {
  const projectSettings: ProjectSettings = {
    appName: "",
    projectId: uuid.v4(),
    currentEnv: "default",
    solutionSettings: {
      name: "fx-solution-azure",
      version: "1.0.0",
    },
  };
  const solutionContext: SolutionContext = {
    projectSettings: projectSettings,
    config: new Map<string, PluginConfig>(),
    root: inputs.projectPath || "",
    ...tools,
    ...tools.tokenProvider,
    answers: inputs,
    cryptoProvider: new LocalCrypto(projectSettings.projectId),
  };
  return solutionContext;
}
