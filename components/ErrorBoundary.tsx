import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text } from 'react-native';
import { Button } from './ui/button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('ErrorBoundary caught:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View className="flex-1 items-center justify-center bg-background p-6">
                    <Text className="text-2xl font-bold text-foreground mb-4">
                        エラーが発生しました
                    </Text>
                    <Text className="text-muted-foreground mb-6 text-center">
                        アプリの起動中に問題が発生しました。{'\n'}
                        再起動をお試しください。
                    </Text>
                    {__DEV__ && this.state.error && (
                        <Text className="text-xs text-red-600 mb-4">
                            {this.state.error.toString()}
                        </Text>
                    )}
                    <Button
                        onPress={() => this.setState({ hasError: false, error: null })}
                        className="bg-primary"
                    >
                        <Text className="text-primary-foreground">再試行</Text>
                    </Button>
                </View>
            );
        }

        return this.props.children;
    }
}
