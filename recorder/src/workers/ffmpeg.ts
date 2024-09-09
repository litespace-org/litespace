import { sleep } from "@/lib/time";
import { calls } from "@litespace/models";
import { ICall } from "@litespace/types";
import { groupBy, isEmpty, map, orderBy } from "lodash";
import { joinVideos, processArtifacts } from "@/lib/ffmpeg";
import dayjs from "@/lib/dayjs";
import fs from "node:fs";
import { findCallArtifacts } from "@/lib/call";
import { safe } from "@/lib/error";
import { performance } from "node:perf_hooks";
import "colors";
import { serverConfig } from "@/config";
import { logger } from "@/lib/log";

function isValidCallMembers(members: number[]): members is [number, number] {
  return members.length === 2;
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
  const { log, info, success, error } = logger("ffmpeg");

  if (!fs.existsSync(serverConfig.assets)) fs.mkdirSync(serverConfig.assets);
  if (!fs.existsSync(serverConfig.artifacts))
    fs.mkdirSync(serverConfig.artifacts);

  while (true) {
    const result = await safe(async () => {
      // get calls with "recording" status and mark them as "recorded" if needed
      const recordingCalls = await calls.findCallsByRecordingStatus(
        ICall.RecordingStatus.Recording
      );

      info(`Found ${recordingCalls.length} in recording status`);

      if (!isEmpty(recordingCalls)) {
        const ended = recordingCalls.filter((call) =>
          dayjs
            .utc(call.start)
            .add(call.duration, "minutes")
            .isBefore(dayjs.utc(), "minutes")
        );

        info(
          `${ended.length} of ${recordingCalls.length} ended. Will be marked as recorded.`
        );

        await calls.update(map(ended, "id"), {
          recordingStatus: ICall.RecordingStatus.Recorded,
        });
      }

      // get all recorded calls
      const recordedCalls = await calls.findCallsByRecordingStatus(
        ICall.RecordingStatus.Recorded
      );
      if (isEmpty(recordedCalls)) return info(`Found no call to be proccessed`);
      info(`Found ${recordedCalls.length} calls to be processed`);

      const ids = map(recordedCalls, "id");
      const members = await calls.findCallMembers(ids);
      const membersMap = groupBy(members, "callId");

      // mark recorded calls as queued
      await calls.update(map(recordedCalls, "id"), {
        recordingStatus: ICall.RecordingStatus.Queued,
      });
      success(`Marked calls as queued`);

      // order calls by start time (older calls come first)
      const orderedCalls = orderBy(
        recordedCalls,
        (call) => dayjs.utc(call.start).unix(),
        ["asc"]
      );
      // process calls sequentially
      for (const call of orderedCalls) {
        const { artifacts, files } = await findCallArtifacts(call.id);
        const empty = isEmpty(artifacts) || isEmpty(files);

        if (empty) {
          log(`"${call}" has no artifacts, will be marked as empty`);
          await calls.update([call.id], {
            recordingStatus: ICall.RecordingStatus.Empty,
          });
          continue; // skip to the next call
        }

        const callMembers = membersMap[call.id.toString()] || [];
        const callMembersIds = map(callMembers, "userId");
        if (!isValidCallMembers(callMembersIds)) continue; // skip calls with members other than two.

        const start = performance.now();
        const output = await safe(() =>
          processArtifacts({ artifacts, files, call: call.id })
        );
        const end = performance.now();
        const time = Math.floor(end - start);
        const formatted = formatTime(time);

        const errorOutput = result instanceof Error;

        if (errorOutput)
          error(`Failed to process ${call.id}: ${result.message}`);
        else success(`${call.id} is processed successfully in ${formatted}`);

        const updateResult = await safe(async () =>
          calls.update([call.id], {
            recordingStatus: errorOutput
              ? ICall.RecordingStatus.ProcessingFailed
              : ICall.RecordingStatus.Processed,
            processingTime: time,
          })
        );

        if (updateResult instanceof Error)
          error(`Failed to update ${call.id} status`);
      }
    });

    if (result instanceof Error) error(`Iteration error: ${result.message}`);
    await sleep(1_000 * 60);
  }
}

main();
