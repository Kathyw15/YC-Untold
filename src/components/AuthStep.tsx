import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { IconButton } from "./IconButton";
import { Screen } from "./Screen";

type AuthStepProps = {
  testID: string;
  onBack?: () => void;
  backTestID?: string;
  backDisabled?: boolean;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthStep({ testID, onBack, backTestID, backDisabled, children, footer }: AuthStepProps) {
  return (
    <Screen scene="aurora" testID={testID}>
      <AuthStepBody onBack={onBack} backTestID={backTestID} backDisabled={backDisabled} footer={footer}>
        {children}
      </AuthStepBody>
    </Screen>
  );
}

export function AuthStepBody({ onBack, backTestID, backDisabled, children, footer }: Omit<AuthStepProps, "testID">) {
  return (
    <View style={styles.root}>
      <View style={styles.nav}>
        {onBack ? (
          <IconButton icon="chevron-back" label="Back" onPress={onBack} disabled={backDisabled} testID={backTestID} />
        ) : null}
      </View>
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  nav: { height: 52, justifyContent: "center", marginHorizontal: -4 },
  body: { flex: 1, marginHorizontal: -20 },
  bodyContent: { paddingHorizontal: 20, paddingBottom: 16 },
  footer: { paddingTop: 10, paddingBottom: 8 },
});
