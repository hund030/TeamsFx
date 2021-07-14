import * as exec from '@actions/exec'

export async function Execute(cmd: string): Promise<number> {
  return await exec.exec(cmd, undefined, {
    cwd: process.env.GITHUB_WORKSPACE
  })
}
