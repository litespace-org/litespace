import { Avatar } from "@/components/Avatar";
import EmptyPastLessons from "@/components/Lessons/EmptyPastLessons";
import { Typography } from "@/components/Typography";
import { formatMinutes } from "@/components/utils";
import { useFormatMessage } from "@/hooks";
import { useWeekdayMap } from "@/hooks/datetime";
import dayjs from "@/lib/dayjs";
import {
	createColumnHelper,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import cn from "classnames";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

type Props = {
	data: {
		date: string;
		duration: number;
		tutor: {
			id: number;
			name?: string | undefined;
			image?: string | undefined;
		};
	}[];
};
export const PastLessonsTable: React.FC<Props> = ({ data }) => {
	const intl = useFormatMessage();
	const weekday = useWeekdayMap();
	const weekdayMap = useMemo(
		() => ({
			0: weekday.sunday,
			1: weekday.monday,
			2: weekday.tuesday,
			3: weekday.wednesday,
			4: weekday.thursday,
			5: weekday.friday,
			6: weekday.saturday,
		}),
		[
			weekday.friday,
			weekday.monday,
			weekday.saturday,
			weekday.sunday,
			weekday.thursday,
			weekday.tuesday,
			weekday.wednesday,
		]
	);

	const columnHelper = createColumnHelper<Props["data"][0]>();
	const columns = useMemo(
		() => [
			columnHelper.accessor("date", {
				header: intl("labels.date"),
				cell: (info) => (
					<Typography
						element="body"
						weight="regular"
						className="tw-text-natural-950 tw-mb-4"
					>
						{weekdayMap[dayjs(info.getValue()).day()] +
							" - " +
							dayjs(info.getValue()).format("D MMMM YYYY")}
					</Typography>
				),
			}),
			columnHelper.accessor("duration", {
				header: intl("labels.duration"),
				cell: (info) => (
					<Typography
						element="body"
						weight="regular"
						className="tw-text-natural-950 tw-mb-4"
					>
						{formatMinutes(info.getValue())}
					</Typography>
				),
			}),
			columnHelper.accessor("tutor", {
				header: intl("labels.tutor"),
				cell: (info) => (
					<div className="tw-flex tw-items-center tw-gap-2 tw-mb-4">
						<div className="tw-w-10 tw-h-10 tw-overflow-hidden tw-rounded-full">
							<Avatar
								src={info.row.original.tutor.image}
								seed={info.row.original.tutor.id.toString()}
								alt={info.row.original.tutor.name}
							/>
						</div>
						<Typography
							element="body"
							weight="semibold"
							className="tw-text-natural-950"
						>
							{info.row.original.tutor.name}
						</Typography>
					</div>
				),
			}),
			columnHelper.display({
				id: "actions",
				cell: () => (
					<Link
						to="/lessons"
						className="tw-px-4 tw-py-2 tw-border tw-border-brand-700 tw-rounded-lg tw-inline-block tw-mb-4"
					>
						<Typography
							element="caption"
							weight="semibold"
							className="tw-text-brand-700"
						>
							{intl("lessons.button.join-another-lesson")}
						</Typography>
					</Link>
				),
			}),
		],
		[columnHelper, intl, weekdayMap]
	);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});
	return (
		<div className="tw-w-full tw-flex tw-flex-col tw-items-center">
			<div
				className={cn(
					"tw-w-full tw-pl-8",
					"tw-overflow-y-auto tw-scrollbar-thin tw-scrollbar-thumb-border-stronger tw-scrollbar-track-surface-300",
					"tw-overflow-x-auto tw-h-[24vh]"
				)}
			>
				<table className="tw-min-w-full">
					<thead className="tw-border-b tw-border-b-natural-500">
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="tw-pb-2 tw-text-start"
										colSpan={header.colSpan}
										scope="col"
									>
										<Typography
											element="caption"
											weight="regular"
											className="tw-text-natural-600"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext()
												  )}
										</Typography>
									</th>
								))}
							</tr>
						))}
					</thead>
					{/* as space for seprating bet the tabe head and body */}
					<div className="tw-h-6">&nbsp;</div>
					{data.length ? (
						<tbody>
							{table.getRowModel().rows.map((row) => (
								<tr key={row.id}>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					) : null}
				</table>
			</div>
			{!data.length ? <EmptyPastLessons className="tw-pt-8" /> : null}
		</div>
	);
};

export default PastLessonsTable;
