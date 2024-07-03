import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

type AddCheckListItemDialogProps = {
    open: boolean,
    handleClose: () => void,
    handleAddItem: (e: React.SyntheticEvent<HTMLFormElement>) => void
}

export default function AddCheckListItemDialog({ open, handleClose, handleAddItem }: AddCheckListItemDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{
                component: 'form',
                onSubmit: handleAddItem,
            }}>
            <DialogTitle>
                Add item
            </DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    required
                    margin="dense"
                    name="text"
                    label="Item text"
                    type="text"
                    fullWidth
                    variant="standard" />
                <FormControlLabel control={<Checkbox name="isDone" />} label="Is task complete?" />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button type="submit">Add Item</Button>
            </DialogActions>
        </Dialog>
    );
}
