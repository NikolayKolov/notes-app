import Checkbox from '@mui/material/Checkbox';
import ListItem from "@mui/material/ListItem";
import ListItemText from '@mui/material/ListItemText';
import FormControlLabel from '@mui/material/FormControlLabel';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type NoteCheckListItemProps = {
    item: {
        tempId: string,
        text: string,
        isDone: boolean,
    },
    handleItemListDone: (e: React.SyntheticEvent<HTMLInputElement>) => void,
    handleDeleteItem: (id: string) => void
}

export default function NoteCheckListItem({ item, handleItemListDone, handleDeleteItem }: NoteCheckListItemProps) {
    // add drag and drop functionality
    const {
        attributes,
        isDragging,
        listeners,
        setNodeRef,
        // add to DragIndicatorIcon, drag only by pressing down on it
        setActivatorNodeRef,
        transform,
        transition
    } = useSortable({ id: item.tempId });

    const style: CSSProperties = {
        opacity: isDragging ? 0.4 : undefined,
        transform: CSS.Translate.toString(transform),
        transition
    };

    return (
        <ListItem
            key={item.tempId}
            ref={setNodeRef}
            sx={style}>
            <ListItemIcon {...attributes} {...listeners} ref={setActivatorNodeRef} sx={{
                marginLeft: '0.5rem'
            }}>
                <IconButton title="Drag Item">
                    <DragIndicatorIcon />
                </IconButton>
            </ListItemIcon>
            <ListItemText sx={item.isDone ? {
                textDecoration: 'line-through',
                color: 'text.disabled'
            } : {}}>
                {item.text}
            </ListItemText>
            <FormControlLabel control={
                <Checkbox
                    name="isComplete"
                    checked={item.isDone}
                    id={'item-isDone_'+item.tempId}
                    onChange={handleItemListDone} />}
                    label="Is task complete?" />
            <ListItemSecondaryAction>
                <IconButton title="Remove Item" onClick={() => handleDeleteItem(item.tempId as string)}>
                    <DeleteIcon />
                </IconButton>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

