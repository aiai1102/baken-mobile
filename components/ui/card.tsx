import { View, type ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

interface CardProps extends ViewProps {
    className?: string;
}

export function Card({ className, ...props }: CardProps) {
    return (
        <View
            className={cn(
                "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
                className
            )}
            {...props}
        />
    );
}
