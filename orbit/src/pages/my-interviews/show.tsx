import { ICall, IUser } from "@litespace/types";
import {
  DateField,
  Show,
  ShowButton,
  TagField,
  TextField,
  UrlField,
} from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Flex, Button } from "antd";
import dayjs from "@/lib/dayjs";
import { Resource } from "@/providers/data";

const { Title } = Typography;

export const MyInterviewShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<ICall.HostCall>({});

  console.log({ data, src: "klk" });

  return (
    <Show isLoading={isLoading}>
      <Flex vertical gap="20px">
        {data ? (
          <>
            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Call ID :
              </Title>
              <TextField value={data.data.id} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Tutor Email :
              </Title>
              <TextField value={data.data.attendeeEmail} />

              <ShowButton
                size="small"
                resource={Resource.Tutors}
                recordItemId={data.data.attendeeId}
              />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Interview :
              </Title>
              <TextField value={dayjs(data.data.start).fromNow()} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Name :
              </Title>
              <TextField value={data.data.attendeeName} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Created:
              </Title>
              <TextField value={dayjs(data.data.createdAt).fromNow()} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Updated:
              </Title>
              <TextField value={dayjs(data.data.updatedAt).fromNow()} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Interview URL :
              </Title>
              <UrlField value="Zoom URL" href={data.data.meetingUrl} />
            </Flex>
          </>
        ) : null}
      </Flex>
    </Show>
  );
};
