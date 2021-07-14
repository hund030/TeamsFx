import * as core from '@actions/core'
import {ActionInputs, Commands} from '../constant'
import {InputsError} from '../errors'
import {OptionsMapQuerier} from '../optionsMapQuerier'

export function BuildCommandString(): string {
  const command = core.getInput(ActionInputs.Command)
  if (!command) {
    throw new InputsError(`The command is empty string.`)
  }

  let commandPrefix: string = command

  const subCommands = core.getMultilineInput(ActionInputs.SubCommands)
  if (subCommands.length > 0) {
    commandPrefix = `${commandPrefix} ${subCommands.join(' ')}`
  }

  // Query optionsMap for options.
  const optionsPart: string[] = []
  const options = OptionsMapQuerier.instance.query(commandPrefix)
  for (const optionName of options) {
    const optionValue = core.getInput(optionName)
    if (!optionValue) {
      optionsPart.push(`${Commands.AddOptionPrefix(optionName)} ${optionValue}`)
    }
  }

  return `${Commands.TeamsfxCliName} ${commandPrefix} ${optionsPart.join(' ')}`
}
