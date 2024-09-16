import { IInterview } from "@litespace/types";
import React from "react";

const List: React.FC<{
  list: IInterview.FindInterviewsApiResponse["list"];
}> = ({ list }) => {
  return <div>{list.length}</div>;
};

export default List;
