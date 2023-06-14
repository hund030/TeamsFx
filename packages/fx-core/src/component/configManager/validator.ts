import Ajv, { ValidateFunction } from "ajv";
import fs from "fs-extra";
import path from "path";
import { getResourceFolder } from "../../folder";
import { YAMLDiagnostics } from "./diagnostic";

type Version = string;
const supportedVersions = ["1.0.0", "1.1.0"];

export class Validator {
  impl: Map<Version, { validator: ValidateFunction; yamlDiagnostics: YAMLDiagnostics }>;

  constructor() {
    this.impl = new Map();
    for (const version of supportedVersions) {
      this.initVersion(version);
    }
  }

  private initVersion(version: string) {
    const ajv = new Ajv();
    ajv.addKeyword("deprecationMessage");
    const schemaPath = path.join(getResourceFolder(), "yaml-schema", version, "yaml.schema.json");
    const schema = fs.readJSONSync(schemaPath);
    const schemaString = fs.readFileSync(schemaPath, "utf8");

    this.impl.set(version, {
      validator: ajv.compile(schema),
      yamlDiagnostics: new YAMLDiagnostics(schemaPath, schemaString),
    });
  }

  isVersionSupported(version: string): boolean {
    return this.supportedVersions().includes(version);
  }

  supportedVersions(): string[] {
    return supportedVersions;
  }

  private latestSupportedVersion(): string {
    return supportedVersions[supportedVersions.length - 1];
  }

  async generateDiagnosticMessage(
    yamlPath: string,
    yamlString: string,
    version?: string
  ): Promise<string | undefined> {
    const impl = this.impl.get(version ?? this.latestSupportedVersion());
    if (!impl) {
      return undefined;
    }
    return impl.yamlDiagnostics.doValidation(yamlPath, yamlString);
  }

  validate(obj: Record<string, unknown>, version?: string): boolean {
    const impl = this.impl.get(version ?? this.latestSupportedVersion());
    if (!impl) {
      return false;
    }
    return !!impl.validator(obj);
  }
}