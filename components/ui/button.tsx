import { Text, Pressable, type PressableProps } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps extends PressableProps {
    className?: string;
    variant?: 'default' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    children: React.ReactNode;
}

export function Button({ className, variant = 'default', size = 'default', children, ...props }: ButtonProps) {
    return (
        <Pressable
            className={cn(
                "items-center justify-center rounded-md",
                variant === 'default' && "bg-primary",
                variant === 'outline' && "border border-input bg-background",
                variant === 'ghost' && "hover:bg-accent hover:text-accent-foreground",
                size === 'default' && "h-10 px-4 py-2",
                size === 'sm' && "h-9 rounded-md px-3",
                size === 'lg' && "h-11 rounded-md px-8",
                size === 'icon' && "h-10 w-10",
                className
            )}
            {...props}
        >
            <Text className={cn(
                "text-sm font-medium",
                variant === 'default' && "text-primary-foreground",
                variant === 'outline' && "text-foreground",
            )}>
                {children}
            </Text>
        </Pressable>
    );
}
