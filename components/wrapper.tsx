    // components/wrapper.tsx
    import React from "react";
import { ScrollView, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTabBottomSpace } from "./tab-layout-utils";

    type ScreenWrapperProps = {
    children: React.ReactNode;
    scroll?: boolean;

    style?: ViewStyle | ViewStyle[];
    containerStyle?: ViewStyle | ViewStyle[];

    contentContainerStyle?: ViewStyle | ViewStyle[];
    contentStyle?: ViewStyle | ViewStyle[];

    scrollProps?: React.ComponentProps<typeof ScrollView>;

    extraBottom?: number;

    edges?: ("top" | "bottom" | "left" | "right")[];
    };

    export function ScreenWrapper({
    children,
    scroll = true,
    style,
    containerStyle,
    contentContainerStyle,
    contentStyle,
    scrollProps,
    extraBottom = 0,
    edges = ["top", "left", "right"],
    }: ScreenWrapperProps) {
    const baseSafe: ViewStyle = { flex: 1, backgroundColor: "#FFFFFF" };
    const bottomSpace = useTabBottomSpace(extraBottom);

    const resolvedContainer =
        (containerStyle as any) ?? (style as any); // chấp nhận cả 2 tên
    const resolvedContent =
        (contentStyle as any) ?? (contentContainerStyle as any);

    if (scroll) {
        return (
        <SafeAreaView edges={edges} style={[baseSafe, resolvedContainer]}>
            <ScrollView
            {...scrollProps}
            style={{ flex: 1 }}
            contentContainerStyle={[{ paddingTop: 8 }, resolvedContent]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            >
            {children}
            <View style={{ height: bottomSpace }} />
            </ScrollView>
        </SafeAreaView>
        );
    }

    return (
        <SafeAreaView edges={edges} style={[baseSafe, resolvedContainer]}>
        <View style={[{ flex: 1, paddingTop: 8, paddingBottom: bottomSpace }, resolvedContent]}>
            {children}
        </View>
        </SafeAreaView>
    );
    }
