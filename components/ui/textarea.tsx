import { TextInput, type TextInputProps } from 'react-native';
import { cn } from '../../lib/utils';

interface TextareaProps extends TextInputProps {
    className?: string;
}

export function Textarea({ className, ...props }: TextareaProps) {
    return (
        <TextInput
            className={cn(
                "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            multiline
            textAlignVertical="top"
            placeholderTextColor="#666"
            {...props}
        />
    );
}
