import { IUser, IZoomAccount } from "@litespace/types";
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

export const ZoomAccountShow = () => {
  const {
    queryResult: { data, isLoading },
  } = useShow<IZoomAccount.Self>({});

  const zoomAccount = data?.data;

  return (
    <Show title="Zoom Account" isLoading={isLoading}>
      <Flex vertical gap="20px">
        {zoomAccount ? (
          <>
            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                ID :
              </Title>
              <TextField value={zoomAccount.id} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Email :
              </Title>
              <TextField value={zoomAccount.email} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Account ID:
              </Title>
              <TagField value={zoomAccount.accountId} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Client ID :
              </Title>
              <TagField value={zoomAccount.clientId} />
            </Flex>

            <Flex align="center" gap="10px">
              <Title level={5} style={{ margin: 0 }}>
                Client Secret :
              </Title>
              <TagField value={zoomAccount.clientSecret} />
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
