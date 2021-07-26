import { Value } from "./marker";
export declare const ENV_VAR_NAME: string;
/**
 * Checks whether a failpoint is activated.
 *
 * @param failpointName
 * @returns failpoint value if the failpoint identifed by failpointName is activated.
 *          Returns undefined otherwise.
 */
export declare function evaluate(failpointName: string): Value | undefined;
export declare function clearFailpointCache(): void;
//# sourceMappingURL=runtime.d.ts.map