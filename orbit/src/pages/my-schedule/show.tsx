import { ISlot, IUser } from "@litespace/types";
import {
  BooleanField,
  DateField,
  ImageField,
  Show,
  TagField,
  TextField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Flex } from "antd";
import React from "react";

const { Title } = Typography;

export const MyScheduleShow: React.FC = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<ISlot.Self>({});

  return <Show isLoading={isLoading}></Show>;
};
