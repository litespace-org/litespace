import { sleep } from "@/lib/time";
import { calls } from "@litespace/models";
import { ICall } from "@litespace/types";
import { groupBy, map, orderBy } from "lodash";
import { joinVideos, processArtifacts } from "@/lib/ffmpeg";
import dayjs from "@/lib/dayjs";
import fs from "node:fs";
import { findCallArtifacts } from "@/lib/call";
import { safe } from "@/lib/error";
import { performance } from "node:perf_hooks";
import "colors";

type CallRecordingPaths = {
  first: string;
  second: string;
  output: string;
};

function isValidCallMembers(members: number[]): members is [number, number] {
  return members.length === 2;
}

function constructCallRecordingPaths(
  call: number,
  members: [number, number]
): CallRecordingPaths {
  const [firstMember, secondMember] = members;
  // const first = asRecordingPath(call, firstMember);
  // const second = asRecordingPath(call, secondMember);
  // const output = asProcessedPath(call);
  return { first: "", second: "", output: "" };
}

async function processCall({
  first,
  second,
  output,
}: CallRecordingPaths): Promise<Error | number> {
  return safe(async () => {
    const firstExists = fs.existsSync(first);
    const secondExists = fs.existsSync(second);

    if (fs.existsSync(output))
      throw new Error(`${output} already exist. Call is already processed?!`);

    if (firstExists && !secondExists) {
      fs.renameSync(first, output);
      return 0;
    }

    if (secondExists && !firstExists) {
      fs.renameSync(second, output);
      return 0;
    }

    if (!firstExists && !secondExists)
      throw new Error(
        `Neither ${first} or ${second} exist.At least one should exist. Call is not recorded?!`
      );

    const start = performance.now();
    await joinVideos({ first, second, output });
    const end = performance.now();
    return Math.floor(end - start);
  });
}

async function clean(paths: Omit<CallRecordingPaths, "output">) {
  return safe(async () => {
    if (fs.existsSync(paths.first)) fs.rmSync(paths.first);
    if (fs.existsSync(paths.second)) fs.rmSync(paths.second);
  });
}

function formatTime(ms: number) {
  const msMinuteCount = 60 * 1000;
  const msSecondCound = 1000;
  const minutes = Math.floor(ms / msMinuteCount);
  const remaining = Math.floor(ms - minutes * msMinuteCount);
  const seconds = Math.floor(remaining / msSecondCound);
  return `${minutes} min and ${seconds} sec`;
}

async function main() {
  let iteration = 0;
  const withIteration = <T>(message: T) => `[${iteration}] ${message}`;

  while (true) {
    const result = await safe(async () => {
      // get calls with "recording" status and mark them as "recorded" if needed
      // const recordingCalls = await calls.findCallsByRecordingStatus(
      //   ICall.RecordingStatus.Recording
      // );

      // console.log(
      //   withIteration(`Found ${recordingCalls.length} in recording status`).gray
      // );

      // if (recordingCalls.length) {
      //   const ended = recordingCalls.filter((call) =>
      //     dayjs
      //       .utc(call.start)
      //       .add(call.duration, "minutes")
      //       .isBefore(dayjs.utc(), "minutes")
      //   );

      //   console.log(
      //     withIteration(
      //       `${ended.length} of ${recordingCalls.length} ended. Will be marked as recorded.`
      //         .gray
      //     )
      //   );

      //   await calls.update(map(ended, "id"), {
      //     recordingStatus: ICall.RecordingStatus.Recorded,
      //   });
      // }

      // get all recorded calls
      const recordedCalls = await calls.findCallsByRecordingStatus(
        ICall.RecordingStatus.Recording
      );

      if (recordedCalls.length === 0)
        return console.log(
          withIteration(`Found no call to be proccessed`).yellow
        );

      const ids = map(recordedCalls, "id");
      const members = await calls.findCallMembers(ids);
      const membersMap = groupBy(members, "callId");
      console.log(
        withIteration(`Found ${recordedCalls.length} calls to be processed`)
          .cyan
      );

      // mark recorded calls as queued
      // await calls.update(map(recordedCalls, "id"), {
      //   recordingStatus: ICall.RecordingStatus.Queued,
      // });
      // console.log(`Marked calls as queued`.green);

      // order calls by start time (older comes first)
      const orderedCalls = orderBy(
        recordedCalls,
        (call) => dayjs.utc(call.start).unix(),
        ["asc"]
      );
      // process calls sequentially
      for (const call of orderedCalls) {
        const { artifacts, files } = await findCallArtifacts(call.id);
        await processArtifacts({ artifacts, files, call: call.id });

        // const groups = groupArtifacts(
        //   artifacts.map((artifact, idx) => {
        //     const others = omitByIdex(artifacts, idx);
        //     const breakpoints = findBreakPoints(artifact, others);
        //     const slices = asArtifactSlices(artifact, breakpoints);
        //     return { slices, artifact };
        //   })
        // );

        // console.log({ groups });

        // const callMembers = membersMap[call.id.toString()] || [];
        // const callMembersIds = map(callMembers, "userId");
        // if (!isValidCallMembers(callMembersIds)) continue; // skip calls with members other than two.

        // const paths = constructCallRecordingPaths(call.id, callMembersIds);
        // const output = await processCall(paths);
        // const error = output instanceof Error;

        // if (error)
        //   console.log(
        //     withIteration(`Failed to process ${call.id}: ${output.message}`).red
        //   );
        // else
        //   console.log(
        //     withIteration(
        //       `${call.id} is processed successfully in ${formatTime(output)}`
        //     ).green
        //   );

        // const result = await safe(async () =>
        //   calls.update([call.id], {
        //     recordingStatus: error
        //       ? ICall.RecordingStatus.ProcessingFailed
        //       : ICall.RecordingStatus.Processed,
        //     processingTime: error ? undefined : output,
        //   })
        // );

        // if (result instanceof Error)
        //   console.log(withIteration(`Failed to update ${call.id} status`).red);

        // // don't clean in case of processing error
        // if (output instanceof Error) return;

        // const cleanError = await clean(paths);
        // if (cleanError instanceof Error)
        //   console.log(
        //     withIteration(
        //       `Failed to clean after processing "${call}": ${cleanError.message}`
        //     ).red
        //   );
      }
    });

    if (result instanceof Error)
      console.log(withIteration(`Iteration error: ${result.message}`).red);
    await sleep(1_000 * 60);
    iteration++;
  }
}

main();
