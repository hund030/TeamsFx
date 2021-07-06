import {
  Result,
  FxError,
  err,
  ok,
  returnUserError,
  ConfigFolderName,
} from "@microsoft/teamsfx-api";
import { isValidProject } from "@microsoft/teamsfx-core";
import { ext } from "../extensionVariables";
import { ExtensionErrors, ExtensionSource } from "../error";
import * as vscode from "vscode";
import * as StringResources from "../resources/Strings.json";
import * as fs from "fs-extra";
import * as path from "path";
import { ExtTelemetry } from "../telemetry/extTelemetry";
import { TelemetryEvent, TelemetryProperty } from "../telemetry/extTelemetryEvents";

export async function selectAndDebug(): Promise<Result<null, FxError>> {
  if (ext.workspaceUri && isValidProject(ext.workspaceUri.fsPath)) {
    await vscode.commands.executeCommand("workbench.view.debug");
    await vscode.commands.executeCommand("workbench.action.debug.selectandstart");
    return ok(null);
  } else {
    const error = returnUserError(
      new Error(StringResources.vsc.handlers.invalidProject),
      ExtensionSource,
      ExtensionErrors.InvalidProject
    );

    return err(error);
  }
}

export function registerRunIcon(): void {
  ext.context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => enableRunIcon(false))
  );
  ext.context.subscriptions.push(
    vscode.workspace.onDidChangeWorkspaceFolders(() => enableRunIcon(true))
  );
  enableRunIcon(true);
}

let lastUpdatedProjectStatusTime: number | undefined;
let lastProjectStatus: boolean | undefined;

function enableRunIcon(forceUpdate: boolean): void {
  if (
    forceUpdate ||
    !lastUpdatedProjectStatusTime ||
    Date.now() - lastUpdatedProjectStatusTime > 5 * 1000
  ) {
    const projectStatus = simpleValidProjectValidation();

    if (projectStatus !== lastProjectStatus) {
      ExtTelemetry.sendTelemetryEvent(TelemetryEvent.RunIconProjectStatus, {
        [TelemetryProperty.ProjectStatus]: projectStatus ? "valid" : "invalid",
      });
    }

    lastProjectStatus = projectStatus;
    lastUpdatedProjectStatusTime = Date.now();
    vscode.commands.executeCommand("setContext", "fx-extension.runIconActive", projectStatus);
  }
}

function simpleValidProjectValidation(): boolean {
  if (!ext.workspaceUri || !ext.workspaceUri.fsPath) {
    return false;
  }

  try {
    const configFolderPath = path.resolve(ext.workspaceUri.fsPath, `.${ConfigFolderName}`);
    const stats = fs.lstatSync(configFolderPath);

    if (stats.isDirectory()) {
      return true;
    }
  } catch {}

  return false;
}
