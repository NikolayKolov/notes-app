import { useContext, useState } from "react";
import { AuthenticationContextWrapper } from "../../contexts/authenticationContext";
import useSWR, { mutate, useSWRConfig } from "swr";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { useParams } from "react-router-dom";
import editNoteItem from "../../api/editNoteItem";
import getNoteById from "../../api/getNoteById";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { FormStatus } from "../../lib/types";
import FormAlert from "../RegistrationForm/FormAlert";
import { CreateNoteType } from "../../validators/noteValidator";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Fetcher = () => Promise<CreateNoteType>;

type CheckListItem = { id: string, order: number, text: string, isDone: boolean };

const NoteView = () => {
    const { noteId } = useParams();
    const [auth, ] = useContext(AuthenticationContextWrapper);
    const fetcher: Fetcher = () => getNoteById(noteId ?? '', auth?.jwt ?? '');
    const { cache } = useSWRConfig();
    const { data, error, isLoading, isValidating } = useSWR('/api/note/' + noteId, fetcher, {
        revalidateOnFocus: false,
        // revalidate on mount only if there is no cached data
        revalidateOnMount: cache.get('/api/note/' + noteId) === undefined,
        // revalidate on mutate when creating or editing a note,
        // otherwise every hour
        refreshInterval: 1000 * 60 * 60,
    });
    const [status, setStatus] = useState<FormStatus>('idle');

    console.log('NoteView data', data)
    console.log('NoteView isLoading', isLoading)
    console.log('NoteView isValidating', isValidating)

    const statusMessages = {
        idle: 'You can edit checklist is task complete',
        loading: 'Please wait, updating...',
        success: 'Update successfull',
        error: 'An error occured',
        errorNetwork: 'Network error, please try again later'
    }

    const handleNoteUpdate = async (e: React.SyntheticEvent<HTMLInputElement>) => {
        setStatus('loading');
        const target = e.target as HTMLInputElement;
        const id = target.id.split('_')[1];
        const isDone = target.checked;

        if (data?.type !== 'CHECKLIST') return;

        try {
            const response = await editNoteItem(Number(noteId), id, isDone, auth!.jwt as string);
            
            if (!response.ok) {
                setStatus('error');
            } else {
                setStatus('success');
                // revalidate current note 
                mutate('/api/note/' + noteId);
                // clearing cache causes revalidation of notes list in home page
                cache.delete('/notes/list/' + auth?.user?.userId);
            }
        } catch(e) {
            setStatus('errorNetwork');
        }
        
    }

    if (isLoading) return (
        <Paper elevation={3} sx={{m: 3, p: 2, maxWidth: 700 }}>
            <Skeleton animation="wave" variant="text" sx={{ fontSize: '2.5rem' }} />
            <Skeleton animation="wave" variant="rectangular" height={250} />
            <Skeleton animation="wave" variant="rectangular" height={150} />
        </Paper>
    );

    if (error) {
        try {
            const errorToShow = JSON.parse(error.message);
            return (
                <Paper elevation={3} sx={{m: 3, p: 2 }}>
                    <Alert severity="error">{errorToShow.message ? errorToShow.message : 'An error has occured'}</Alert>
                </Paper>
            );
        } catch {
            return (
                <Paper elevation={3} sx={{m: 3, p: 2 }}>
                    <Alert severity="error">{error.message ? error.message : 'An error has occured'}</Alert>
                </Paper>
            );
        }
    }

    if (data === undefined) return (
        <Paper elevation={3} sx={{m: 3, p: 2 }}>
            <Alert severity="error">No data to display!</Alert>
        </Paper>
    );

    return (
        <Box
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
                <Paper elevation={3}>
                    <Typography variant="h5" gutterBottom={!!data.content} sx={
                        data.content ? 
                            { borderBottom: 1, borderColor: 'lightgray', py: 1, px: 2 } :
                            { py: 1, px: 2 }}>
                        {data.title}
                    </Typography>
                    {
                        data.content ? 
                            <Typography variant="subtitle1" component="pre" gutterBottom sx={{py: 1, px: 2}}>
                                {data.content}
                            </Typography> :
                            null
                    }
                </Paper>
                {
                    data.type === 'CHECKLIST' && data.listItems && data.listItems?.length > 0 ? 
                        <>
                            <Paper elevation={3}>
                                <Typography variant="h6" gutterBottom sx={{ borderBottom: 1, borderColor: 'lightgray', py: 1, px: 2 }}>
                                    Check list Items
                                </Typography>
                                <List>
                                    {
                                        (data.listItems as CheckListItem[]).sort((a, b) => a.order - b.order).map((item: CheckListItem) => (
                                            <ListItem key={item.id}>
                                                <ListItemText sx={item.isDone ? {
                                                    textDecoration: 'line-through',
                                                    color: 'text.disabled'
                                                } : {}}>
                                                    {item.text}
                                                </ListItemText>
                                                <FormControlLabel control={
                                                    <Checkbox
                                                        name="isComplete"
                                                        disabled={status === 'loading'}
                                                        checked={item.isDone}
                                                        id={'item-isDone_'+item.id}
                                                        onChange={handleNoteUpdate} />}
                                                        label="Is task complete?" />
                                            </ListItem>
                                        ))
                                    }
                                </List>
                            </Paper>
                            <FormAlert status={status} statusMessages={statusMessages} />
                        </> :
                        null
                    }
            </Box>
    );
}

export default NoteView;