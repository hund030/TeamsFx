import {optionsMap} from './optionsMap'

export class OptionsMapQuerier {
  static instance: OptionsMapQuerier

  private constructor() {}

  static getInstance(): OptionsMapQuerier {
    if (!OptionsMapQuerier.instance) {
      OptionsMapQuerier.instance = new OptionsMapQuerier()
    }

    return OptionsMapQuerier.instance
  }

  query(commandPrefix: string): string[] {
    const result: string[] = []

    // Add common options.
    result.push(optionsMap.common)

    // Add command specific options.
    const options = optionsMap[commandPrefix] ?? []
    result.push(options)

    return result
  }
}
