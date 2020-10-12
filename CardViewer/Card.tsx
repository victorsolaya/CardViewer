/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Card } from "@uifabric/react-cards";
import { Stack, IStackTokens, Text, FontWeights, ITextStyles } from "@fluentui/react";
import { MetadataObject } from "./Utilities/CardViewer.types";

function CardItem(props: MetadataObject) {
  return (
    <Card aria-label="Option">
      <Card.Item styles={descriptionTextStyles}>
        <Text variant="xxLarge">{props.name}</Text>
      </Card.Item>
      <Card.Item styles={countTextStyles}>
        <Text variant="mega">{props.count}</Text>
      </Card.Item>
    </Card>
  );
}
function CardView(props: [MetadataObject]): any {
  // export class CardVerticalExample extends React.Component {
  // public render(): JSX.Element {
  const objectJson = Object.values(props);

  const sectionStackTokens: IStackTokens = { childrenGap: 30, padding: "m" };

  return (
    <Stack horizontal tokens={sectionStackTokens} wrap={true} horizontalAlign="center" padding="10">
      {objectJson.length > 0 &&
        objectJson
          .filter((element) => element.count > 0)
          .map((element) => <CardItem key={element.name} count={element.count} name={element.name} />)}
    </Stack>
  );
  // }
}

const descriptionTextStyles: ITextStyles = {
  root: {
    padding: "10px",
    fontWeight: FontWeights.bold,
    textAlign: "center",
  },
};

const countTextStyles: ITextStyles = {
  root: {
    padding: "10px",
    fontWeight: FontWeights.regular,
    textAlign: "center",
  },
};
export default CardView;
