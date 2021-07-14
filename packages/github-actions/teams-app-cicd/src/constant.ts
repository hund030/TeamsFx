/* eslint-disable @typescript-eslint/no-extraneous-class */
export class ActionInputs {
  static readonly Command: string = 'command'
  static readonly SubCommands: string = 'sub-commands'
}

export class ActionOutputs {
  static readonly SharepointPackagePath: string = 'sharepoint-package-path'
  static readonly PackageZipPath: string = 'package-zip-path'
}

export class Commands {
  static readonly TeamsfxCliVersion: string = '0.2.1'
  static readonly TeamsfxCliName: string = 'teamsfx'
  static readonly AddOptionPrefix = (optionName: string): string =>
    `--${optionName}`
}

export class Pathes {
  static readonly EnvDefaultJson: string = '.fx/env.default.json'
  static readonly PackageSolutionJson: string =
    'SPFx/config/package-solution.json'
  static readonly TeamsAppPackageZip: string = '.fx/appPackage.zip'
}

export class Miscs {
  static readonly SolutionConfigKey: string = 'solution'
  static readonly BotConfigKey: string = 'fx-resource-bot'
  static readonly LanguageKey: string = 'programmingLanguage'
}

export class ErrorNames {
  static readonly InputsError: string = 'InputsError'
  static readonly LanguageError: string = 'LanguageError'
  static readonly EnvironmentVariableError: string = 'EnvironmentVariableError'
  static readonly SpfxZippedPackageMissingError: string =
    'SpfxZippedPackageMissingError'
  static readonly InternalError: string = 'InternalError'
}

export class Suggestions {
  static readonly CheckInputsAndUpdate: string =
    'Please check and update the input values.'
  static readonly CheckEnvDefaultJson: string = `Please check the content of ${Pathes.EnvDefaultJson}.`
  static readonly CheckPackageSolutionJson: string = `Please check the content of ${Pathes.PackageSolutionJson}.`
  static readonly RerunWorkflow: string =
    'Please rerun the workflow or pipeline.'
  static readonly CreateAnIssue: string = 'Please create an issue on GitHub.'
}
