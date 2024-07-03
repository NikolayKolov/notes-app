import { z } from 'zod';

const CreateNoteListItem = z.object({
    text: z.string().min(2, { message: 'Note item text must be at least 2 characters long' })
    .max(50, {message: 'Note item text must be less than 50 characters long'}),
    order: z.number().gt(0),
    isDone: z.boolean()
})

export const CreateNote = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('TEXT'),
        title: z.string().min(2, { message: 'Note title must be at least 2 characters long' })
        .max(100, {message: 'Note title must be less than 100 characters long'}),
        userId: z.number().gt(0),
        content: z.string().min(10, { message: 'Note content must be at least 10 characters long' })
        .max(1000, {message: 'Note content must be less than 100 characters long'}),
    }),
    z.object({
        type: z.literal('CHECKLIST'),
        title: z.string().min(2, { message: 'Note title must be at least 2 characters long'}).max(100, { message: 'Note title must be less than 100 characters long'}),
        userId: z.number().gt(0),
        content: z.string().optional(),
        listItems: z.array(CreateNoteListItem)
    })
    // use refine instead of nonempty because z transforms the type and this messes with TypeScript
]).refine((data) => {
    // check for discriminated union option CHECKLIST
    if (data.type ==='CHECKLIST') return data.listItems.length > 0;
    // if not, return true
    return true;
}, {
    message: "Check list must contain at least one item",
    path: ["listItems"],
});

export type CreateNoteType = z.infer<typeof CreateNote>;
export type CreateNoteListItemType = z.infer<typeof CreateNoteListItem>;
export type UpdateNoteListItemType = CreateNoteListItemType & { tempId?: string, origId?: string, id?: string };
export type UpdateNoteType = {
    type: "TEXT";
    title: string;
    userId: number;
    content: string;
} | {
    type: "CHECKLIST";
    title: string;
    userId: number;
    listItems: UpdateNoteListItemType[],
    content?: string | undefined;
}