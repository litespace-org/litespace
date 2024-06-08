import { ITutor, IUser } from "@litespace/types";
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

const { Title } = Typography;

export const TutorShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<ITutor.FullTutor>({});

  return (
    <Show isLoading={isLoading}>
      <Flex vertical gap="20px">
        {data ? (
          <>
            {data.data.avatar ? (
              <Flex align="center" gap="10px">
                <ImageField
                  style={{ borderRadius: "100%" }}
                  value={data.data.avatar}
                  width={200}
                  height={200}
                />
              </Flex>
            ) : null}

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                ID :
              </Title>
              <TextField value={data.data.id} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Email :
              </Title>
              <TextField value={data.data.email} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Online :
              </Title>
              <BooleanField value={data.data.online} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Name :
              </Title>
              <TextField value={data.data.name} />
            </Flex>

            {data.data.bio ? (
              <Flex
                style={{ flexDirection: "column" }}
                justify="center"
                gap="10px"
              >
                <Title level={5} style={{ margin: 0 }}>
                  Bio :
                </Title>
                <TextField value={data.data.bio} />
              </Flex>
            ) : null}

            {data.data.about ? (
              <Flex
                style={{ flexDirection: "column" }}
                justify="center"
                gap="10px"
              >
                <Title level={5} style={{ margin: 0 }}>
                  About :
                </Title>
                <TextField value={data.data.about || "-"} />
              </Flex>
            ) : null}

            {data.data.privateFeedback ? (
              <Flex
                style={{ flexDirection: "column" }}
                justify="center"
                gap="10px"
              >
                <Title level={5} style={{ margin: 0 }}>
                  Public Feedback :
                </Title>
                <TextField value={data.data.publicFeedback} />
              </Flex>
            ) : null}

            {data.data.privateFeedback ? (
              <Flex
                style={{ flexDirection: "column" }}
                justify="center"
                gap="10px"
              >
                <Title level={5} style={{ margin: 0 }}>
                  Private Feedback :
                </Title>
                <TextField value={data.data.privateFeedback} />
              </Flex>
            ) : null}

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Passed Interview :
              </Title>
              <BooleanField value={data.data.passedInterview} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Activated :
              </Title>
              <BooleanField value={data.data.activated} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Gender :
              </Title>

              <TagField value={data.data.gender || "unspecified"} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Birthday :
              </Title>

              {data.data.birthday ? (
                <DateField value={data.data.birthday} format="LL" />
              ) : (
                <TextField value="-" />
              )}
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Created At :
              </Title>
              <DateField value={data.data.createdAt} format="LLL" />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Updated At :
              </Title>
              <DateField value={data.data.updatedAt} format="LLL" />
            </Flex>
          </>
        ) : null}
      </Flex>
    </Show>
  );
};
