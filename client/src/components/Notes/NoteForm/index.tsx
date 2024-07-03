import React, { useContext, useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { AuthenticationContextWrapper } from "../../../contexts/authenticationContext";
import NoteCheckListItem from "../NoteCheckListItem";
import AddCheckListItemDialog from "./components/AddCheckListItemDialog";
import { mutate, useSWRConfig } from "swr";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { FormStatus } from "../../../lib/types";
import { CreateNote, CreateNoteType, UpdateNoteType, CreateNoteListItemType, UpdateNoteListItemType } from "../../../validators/noteValidator";
import Typography from "@mui/material/Typography";
import FormAlert from "../../RegistrationForm/FormAlert";
import Alert from "@mui/material/Alert";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    Active,
    DragEndEvent,
    DragOverlay,
    DropAnimation,
    defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates} from "@dnd-kit/sortable";
import createNote from "../../../api/createNote";
import editNote from "../../../api/editNote";

type NoteFormProps = {
    noteToEdit?: UpdateNoteType & { id: number }
}

const NoteForm = (props: NoteFormProps) => {
    const { noteToEdit } = props;
    const [auth, ] = useContext(AuthenticationContextWrapper);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [formErrors, setFormErrors] = useState<any>({});
    const [formStatus, setFormStatus] = useState<FormStatus>('idle');
    const [noteType, setNoteType] = React.useState<'TEXT' | 'CHECKLIST'>(
        noteToEdit?.type ?
            noteToEdit.type : 
            'TEXT'
    );

    const { cache } = useSWRConfig();

    const initItemsFromNote = () => {
        if (noteToEdit?.type === 'CHECKLIST') {
            return noteToEdit.listItems.map((item: UpdateNoteListItemType) => {
                return ({
                    text: item.text,
                    order: item.order,
                    isDone: item.isDone,
                    tempId: item.id
                })
            });
        } else {
            return [];
        }
    };

    const [listItems, setListItems] = React.useState<Array<UpdateNoteListItemType>>(initItemsFromNote);
    const [open, setOpen] = React.useState(false);
    const [addItemsToEnd, setAddToEnd] = useState(true);
    
    const handleClose = () => { setOpen(false) };
    const handleOpen = () => { setOpen(true) };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const statusMessages = {
        idle: noteToEdit ? 'Please update note data' : 'Please enter note data',
        loading: noteToEdit ? 'Please wait, update pending...' : 'Please wait, creation pending...',
        success: noteToEdit ? 'Update successfull' : 'Creation successfull',
        error: 'Please fix form errors',
        errorNetwork: 'Network error, please try again later'
    }
    
    const handleAddItem = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const formData = e.target as HTMLFormElement;
        const text = formData.text.value;
        const isDone = formData.isDone.checked;
        const newCheckListItem: UpdateNoteListItemType = {
            text,
            isDone,
            order: 0,
            tempId: uuidv4()
        };

        let array = [...listItems];
        if (addItemsToEnd) array = [...array, newCheckListItem];
        else array = [newCheckListItem, ...array];

        array = array.map((elem, index) => ({
            ...elem,
            // set the order by array index
            order: index + 1
        }));

        setListItems([...array]);

        handleClose();
    }

    const handleNoteTypeChange = (_e: React.MouseEvent<HTMLElement>, newType: 'TEXT' | 'CHECKLIST') => {
        setNoteType(newType);
    }

    const handleAddListItem = (addToEnd = true) => {
        setAddToEnd(addToEnd);
        handleOpen();
    }

    const handleDeleteItem = (tempId: string) => {
        let filteredArray = [...listItems].filter((item) => (item.tempId !== tempId));
        filteredArray = filteredArray.map((elem, index) => ({
            ...elem,
            // set the order by array index
            order: index + 1
        }));
        setListItems([...filteredArray]);
    }

    const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setFormStatus('loading');
        setFormErrors({});
        const formData = e.target as HTMLFormElement;
        const title = formData.noteTitle.value;
        const content = formData.content.value;
        const type = noteType;
        const checkListItems = [...listItems] as Array<CreateNoteListItemType>;
        const userId = auth?.user?.userId as string;
        let newNote: CreateNoteType;

        if (type === 'CHECKLIST') {
            newNote = {
                userId: Number(userId),
                title,
                content,
                type: 'CHECKLIST',
                listItems: checkListItems.map(item => (
                    {
                        order: item.order,
                        text: item.text,
                        isDone: item.isDone
                    })
                )
            };
        } else {
            newNote = {
                userId: Number(userId),
                title,
                content,
                type,
            }
        }
        
        const verify = CreateNote.safeParse(newNote);

        if (!verify.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const errorsObject: any = {}
            verify.error.issues.forEach((error) => {
                const errorKey = error.path[0];
                errorsObject[errorKey] = error.message;
            });
            setFormErrors(errorsObject);
            setFormStatus('error');
            return;
        }

        try {
            let response;
            if (noteToEdit === undefined) response = await createNote(newNote, auth!.jwt as string);
            else response = await editNote({...newNote, id: noteToEdit.id}, auth!.jwt as string);
            const data = await response.json();
            
            if (!response.ok) {
                setFormStatus('error');
                if (data?.errorObject !== undefined) setFormErrors(data.errorObject);
                else setFormErrors({
                    custom: data.message
                });
            } else {
                setFormStatus('success');
                // revalidate current note, the page component should contain the mounted useSWR hook
                mutate('/api/note/' + noteToEdit?.id);
                // clearing cache causes revalidation of notes list in home page
                cache.delete('/notes/list/' + auth?.user?.userId);
            }
        } catch(e) {
            setFormStatus('errorNetwork');
        }
    }

    const handleItemListDone = (e: React.SyntheticEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const tempId = target.id.split('_')[1];
        const listItemsNew = listItems.map(item => {
            if (tempId === item.tempId) {
                const newItem: UpdateNoteListItemType = {
                    ...item,
                    isDone: !item.isDone,
                };
                return newItem;
            } else {
                return item
            }
        });
        setListItems([...listItemsNew])
    }

    const [active, setActive] = useState<Active | null>(null);

    const handleOnDragStart = (event: DragEndEvent) => {
        const { active } = event;
        setActive(active);
    }

    const handleOnDragCancel = () => {
        setActive(null);
    }

    const handleOnDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over?.id) {
            const activeIndex = listItems.findIndex((item) => item.tempId === active.id);
            const overIndex = listItems.findIndex((item) => item.tempId === over.id);
  
            let newOrderListItems = arrayMove(listItems, activeIndex, overIndex);
            newOrderListItems = newOrderListItems.map((item, index) => ({
                ...item,
                // set the order by array index
                order: index + 1
            }));
            setListItems(newOrderListItems)
        }
        setActive(null);
    }
    
    const activeItem = useMemo(() => {
        const result = listItems.find((item) => item?.tempId === active?.id);
        return result as UpdateNoteListItemType & { tempId: string };
    }, [active, listItems]);

    const dropAnimationConfig: DropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: "0.4"
                }
            }
        })
    };


    return (
        <>
            <Box
                component='form'
                onSubmit={handleSubmit}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    px: 2,
                    mt: {
                        xs: 2,
                        md: 8
                    },
                    width: {
                        xs: '100%',
                        md: '700px'
                    }
                }}>
                <TextField 
                    required
                    id='note-form-title'
                    name='noteTitle'
                    label="Note title"
                    error={formErrors?.title}
                    helperText={formErrors?.title}
                    defaultValue={noteToEdit?.title}
                    disabled={formStatus === 'loading'} />
                <TextField
                    required={noteType === 'TEXT'}
                    id='note-form-content'
                    name='content'
                    label="Note content"
                    error={formErrors?.content}
                    multiline
                    minRows={4}
                    maxRows={8}
                    defaultValue={noteToEdit?.content}
                    helperText={formErrors?.content}
                    disabled={formStatus === 'loading'} />
                <Typography variant="subtitle1">
                    Add a check list to the note
                </Typography>
                <ToggleButtonGroup
                    exclusive
                    disabled={noteToEdit?.type !== undefined}
                    color="primary"
                    value={noteType}
                    onChange={handleNoteTypeChange}
                    aria-label="Note Type - text or check list">
                    <ToggleButton value="TEXT" sx={{ width: '50%'}}>Text</ToggleButton>
                    <ToggleButton value="CHECKLIST" sx={{ width: '50%'}}>Check List</ToggleButton>
                </ToggleButtonGroup>
                {
                    noteType === 'CHECKLIST' ?
                        <>
                            {
                                formErrors?.listItems !== undefined ?
                                    <Alert severity="error">{formErrors.listItems}</Alert>:
                                    null
                            }
                            <Paper elevation={3}>
                                <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'lightgray', py: 1, px: 2 }}>
                                    Check list Items
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemButton
                                            onClick={() => handleAddListItem(false)}>
                                            <ListItemIcon sx={{minWidth: '40px'}}>
                                                <AddBoxIcon />
                                            </ListItemIcon>
                                            <ListItemText primary='Add item to start of list'></ListItemText>
                                        </ListItemButton>
                                    </ListItem>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragStart={handleOnDragStart}
                                        onDragCancel={handleOnDragCancel}
                                        onDragEnd={handleOnDragEnd}>
                                        <SortableContext items={listItems.map(item => ({id: item.tempId as string}))}>
                                        {
                                            listItems.sort((a,b) => (a.order - b.order)).map((item) => (
                                                <NoteCheckListItem
                                                    key={item.tempId}
                                                    item={item as UpdateNoteListItemType & { tempId: string }}
                                                    handleDeleteItem={handleDeleteItem}
                                                    handleItemListDone={handleItemListDone} />
                                            ))
                                        }
                                        </SortableContext>
                                        <DragOverlay dropAnimation={dropAnimationConfig}>
                                            {
                                                activeItem !== undefined ? 
                                                    <NoteCheckListItem
                                                        item={activeItem}
                                                        handleDeleteItem={handleDeleteItem}
                                                        handleItemListDone={handleItemListDone} /> :
                                                    null
                                            }
                                        </DragOverlay>
                                    </DndContext>
                                    <ListItem>
                                        <ListItemButton
                                            onClick={() => handleAddListItem()}>
                                            <ListItemIcon sx={{minWidth: '40px'}}>
                                                <AddBoxIcon />
                                            </ListItemIcon>
                                            <ListItemText primary='Add item to end of list'></ListItemText>
                                        </ListItemButton>
                                    </ListItem>
                                </List>
                            </Paper>
                        </> :
                        null
                }
                <Button type="submit" size='large' variant="outlined">
                    { noteToEdit !== undefined ? 'Save changes' : 'Create'}
                </Button>
                <FormAlert status={formStatus} statusMessages={statusMessages} />
            </Box>
            <AddCheckListItemDialog
                open={open}
                handleClose={handleClose}
                handleAddItem={handleAddItem} />
        </>
    )
}

export default NoteForm;