import { faker } from "@faker-js/faker/locale/ar";
import { Meta, StoryObj } from "@storybook/react";
import PastLessonsTable from "@/components/Lessons/PastLessonsTable";
import React from "react";

const meta: Meta<typeof PastLessonsTable> = {
	title: "Lessons/PastLessonsTable",
	component: PastLessonsTable,
	decorators: (Story) => (
		<div style={{ width: "85vw" }}>
			<Story />
		</div>
	),
};

export default meta;

type Story = StoryObj<typeof PastLessonsTable>;

const url = "https://picsum.photos/400";

const data = [
	{
		date: new Date("12/3/2024").toISOString(),
		duration: 30,
		tutor: {
			id: 3,
			name: faker.person.fullName(),
			image: url,
		},
	},
	{
		date: new Date("12/3/2024").toISOString(),
		duration: 30,
		tutor: {
			id: 3,
			name: faker.person.fullName(),
			image: url,
		},
	},
	{
		date: new Date("12/3/2024").toISOString(),
		duration: 30,
		tutor: {
			id: 3,
			name: faker.person.fullName(),
			image: url,
		},
	},
	{
		date: new Date("12/3/2024").toISOString(),
		duration: 30,
		tutor: {
			id: 3,
			name: faker.person.fullName(),
			image: url,
		},
	},
	{
		date: new Date("12/3/2024").toISOString(),
		duration: 30,
		tutor: {
			id: 3,
			name: faker.person.fullName(),
			image: url,
		},
	},
];

export const Default: Story = {
	args: {
		data,
	},
};
