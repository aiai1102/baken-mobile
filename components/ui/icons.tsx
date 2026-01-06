import { cssInterop } from 'nativewind';
import { Home, BarChart2, Plus, Trash2, X } from 'lucide-react-native';

function interopIcon(icon: any) {
    cssInterop(icon, {
        className: {
            target: "style",
            nativeStyleToProp: {
                color: true,
                opacity: true,
            },
        },
    });
    return icon;
}

export const IconHome = interopIcon(Home);
export const IconBarChart2 = interopIcon(BarChart2);
export const IconPlus = interopIcon(Plus);
export const IconTrash2 = interopIcon(Trash2);
export const IconX = interopIcon(X);
