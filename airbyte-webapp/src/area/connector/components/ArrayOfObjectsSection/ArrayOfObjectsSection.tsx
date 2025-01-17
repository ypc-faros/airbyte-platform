import get from "lodash/get";
import React, { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { FormattedMessage } from "react-intl";

import GroupControls from "components/GroupControls";
import { Button } from "components/ui/Button";
import { Collapsible } from "components/ui/Collapsible";
import { FlexContainer, FlexItem } from "components/ui/Flex";
import { RemoveButton } from "components/ui/RemoveButton/RemoveButton";

import { FormBlock, FormGroupItem, FormObjectArrayItem } from "core/form/types";
import { FormSection } from "views/Connector/ConnectorForm/components/Sections/FormSection";
import { GroupLabel } from "views/Connector/ConnectorForm/components/Sections/GroupLabel";
import { SectionContainer } from "views/Connector/ConnectorForm/components/Sections/SectionContainer";
import { setDefaultValues } from "views/Connector/ConnectorForm/useBuildForm";

import styles from "./ArrayOfObjectsSection.module.scss";

interface ArrayOfObjectsSectionProps {
  formField: FormObjectArrayItem;
  path: string;
  disabled?: boolean;
}

export const ArrayOfObjectsSection: React.FC<ArrayOfObjectsSectionProps> = ({ formField, path, disabled }) => {
  const { fields: items, append, remove } = useFieldArray({ name: path });
  const [initiallyOpen, setInitiallyOpen] = useState(false);

  const addItemHandler = () => {
    const initialValue = {};
    setDefaultValues(formField.properties, initialValue);
    setInitiallyOpen(true);
    append(initialValue);
  };

  return (
    <SectionContainer>
      <GroupControls
        name={path}
        key={`form-variable-fields-${formField?.fieldKey}`}
        label={<GroupLabel formField={formField} />}
        control={
          <Button
            type="button"
            data-testid="addItemButton"
            variant="secondary"
            onClick={addItemHandler}
            disabled={disabled}
          >
            <FormattedMessage id="form.addItems" />
          </Button>
        }
      >
        {items.map((item, index) => (
          <FlexContainer key={item.id}>
            <FlexItem grow className={styles.container}>
              <ObjectItem item={formField.properties} path={`${path}.${index}`} initiallyOpen={initiallyOpen} />
            </FlexItem>
            <RemoveButton onClick={() => remove(index)} />
          </FlexContainer>
        ))}
      </GroupControls>
    </SectionContainer>
  );
};

interface ObjectItemProps {
  item: FormGroupItem;
  path: string;
  initiallyOpen: boolean;
}

const ObjectItem: React.FC<ObjectItemProps> = ({ item, path, initiallyOpen }) => {
  const { formState } = useFormContext();
  const value = useWatch({ name: path });
  const hasError = Boolean(get(formState.errors, path));

  return (
    <Collapsible
      label={getItemName(value, item.properties)}
      showErrorIndicator={hasError}
      initiallyOpen={initiallyOpen}
    >
      <FormSection blocks={item} path={path} skipAppend />
    </Collapsible>
  );
};

const stringify = (value: unknown): string => {
  if (typeof value === "object") {
    return JSON.stringify(value, null, 1);
  }
  return String(value);
};

const getItemName = (item: Record<string, unknown>, properties: FormBlock[]): string => {
  return Object.keys(item)
    .sort()
    .map((key) => {
      const property = properties.find(({ fieldKey }) => fieldKey === key);
      const name = property?.title ?? key;
      return `${name}: ${stringify(item[key])}`;
    })
    .join(" | ");
};
