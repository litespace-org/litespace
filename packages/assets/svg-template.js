const template = (variables, { tpl }) => {
  return tpl`
import React, { type SVGProps } from "react";

${variables.interfaces};

const ${variables.componentName} = (${variables.props}) => (
  ${variables.jsx}
);

export default React.memo(${variables.componentName});
`;
};

module.exports = template;
