import { IUser } from "@litespace/types";
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

export const UserShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<IUser.Self>({});

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
                Has Password :
              </Title>
              <BooleanField value={data.data.hasPassword} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Online :
              </Title>
              <BooleanField value={data.data.active} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Name :
              </Title>
              <TextField value={data.data.name} />
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

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Type :
              </Title>
              <TagField value={data.data.type} />
            </Flex>

            {/* <MarkdownField value={record?.content} />
          <Title level={5}>{"Category"}</Title>
          <TextField
            value={
              categoryIsLoading ? (
                <>Loading...</>
              ) : (
                <>{categoryData?.data?.title}</>
              )
            }
          />
          <Title level={5}>{"Status"}</Title>
          <TextField value={record?.status} />
          <Title level={5}>{"CreatedAt"}</Title>
          <DateField value={record?.createdAt} /> */}
          </>
        ) : null}
      </Flex>
    </Show>
  );
};
