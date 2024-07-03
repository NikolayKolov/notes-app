import { NoteType, Note, Prisma } from '@prisma/client';
import prisma from '../prisma/prismaClient';
import { JSONErrorResponse } from '../config/types';
import { labels } from '../config/labels';
import { Request, Response } from "express";
import { CreateNote, CreateNoteListItemType, CreateNoteType } from '../utils/validators/createNote';
import cache from '../utils/cache';

const deleteCachedNote = (noteId: string) => {
    const cachedNote = cache.get(`noteID-${noteId}`);
    if (cachedNote !== undefined) cache.del(`noteID-${noteId}`)
}

const getCachedNoteOwner = async (noteId: string, ownerId: string) => {
    let cachedNote: Note | null | undefined = cache.get(`noteID-${noteId}`);
    if (cachedNote !== undefined) return cachedNote;

    try {
        cachedNote = await prisma.note.findUnique({
            where: {
                id: Number(noteId),
                ownerId: Number(ownerId)
            }
        });

        cache.set(`noteID-${noteId}`, cachedNote);
        return cachedNote;
    } catch {
        // if an error occurs, return undefined
        return undefined;
    }
}

// list all notes for the given user
export const getAllNotesByUser = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        const notes: Note[] = await prisma.note.findMany({
            where: {
                ownerId: userId
            },
            include: {
                listItems: {
                    orderBy: {
                        order: 'asc'
                    },
                },
            }
        });

        res.status(200).send(notes);
    } catch (e) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorFindDB,
            message: labels.errorNoteFindMissing,
            messageOrig: (e as Error)?.message,
            stack: (e as Error)?.stack,
            name: (e as Error)?.name
        };

        res.status(500).send(errorResp);
    }
}

// get note by note Id
export const getNoteById = async (req: Request, res: Response) => {
    const { noteId } = req.params;
    const userId = res.locals.userId;

    // check if user is owner of note and can read it
    const cachedNote = await getCachedNoteOwner(noteId, userId);

    // undefined = error
    if (cachedNote === undefined) {
        // if an error occurs, send generic error message
        res.status(500).send({
            status: labels.errorDefaultDB,
            message: labels.errorDefault
        });
    }

    // if user isn't an owner, send unauthorized error message
    if (cachedNote === null) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorNoteOwner
        };
        res.status(403).send(errorResp);
    }

    // otherwise proceed with read and return response
    try {
        const note = await prisma.note.findUnique({
            where: {
                id: Number(noteId)
            },
            include: {
                listItems: {
                    orderBy: {
                        order: 'asc'
                    },
                }
            }
        });

        res.json(note);
        res.status(200);
        res.end();
    } catch (e) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorFindDB,
            message: labels.errorNoteFindMissing,
            messageOrig: (e as Error)?.message,
            stack: (e as Error)?.stack,
            name: (e as Error)?.name
        };
        res.status(500).send(errorResp);
    }
}

// Create new note
export const createNote = async (req: Request<{}, {}, CreateNoteType>, res: Response) => {
    const { type, title, content, userId } = req.body;
    
    let typeInput: NoteType = NoteType.TEXT;
    let noteData: Prisma.NoteCreateInput = {
        title,
        type: typeInput,
        content,
        owner: {
            connect: {
                id: userId
            }
        }
    };

    const noteValidate = CreateNote.safeParse(req.body);
    if (!noteValidate.success) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorCreateDB,
            message: labels.errorNoteValidation,
        };

        res.status(500).send(errorResp);
        return;
    }

    // add checklist items, if defined
    if (type === 'CHECKLIST') {
        typeInput = NoteType.CHECKLIST;
        const listItems = req.body.listItems;
        noteData = {
            ...noteData,
            type: typeInput,
            listItems: {
                create: listItems.map((item: CreateNoteListItemType) => {
                        return {
                            text: item.text,
                            order: item.order,
                            isDone: item.isDone
                        }
                    }
                )
            }
        }
    }
    
    try {
        const note: Note = await prisma.note.create({ data: {
            ...noteData as Prisma.NoteCreateInput
        }});

        res.json(note);
        res.status(200);
        res.end();
    } catch (e) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorCreateDB,
            message: (e as Error)?.message ?? labels.errorDefault,
            messageOrig: (e as Error)?.message,
            stack: (e as Error)?.stack,
            name: (e as Error)?.name
        };
    
        res.status(500).send(errorResp)
    }
}

export const updateNote = async (req: Request<{ noteId: string}, {}, CreateNoteType>, res: Response) => {
    const noteId = req.params.noteId;
    const userId = res.locals.userId;
    const {
        title,
        content,
        type,
    } = req.body;

    // check if user is owner of note and can update it
    const cachedNote = await getCachedNoteOwner(noteId, userId);

    // undefined = error
    if (cachedNote === undefined) {
        // if an error occurs, send generic error message
        res.status(500).send({
            status: labels.errorDefaultDB,
            message: labels.errorDefault
        });
    }

    // check if user is owner of note and can edit it
    if (cachedNote === null) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorNoteOwner
        };
    
        res.status(403).send(errorResp);
    }
    // proceed with edit

    const noteValidate = CreateNote.safeParse(req.body);
    if (!noteValidate.success) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorUpdateDB,
            message: labels.errorNoteValidation,
        };

        res.status(500).send(errorResp);
        return;
    }

    let noteUpdateData: Prisma.NoteUpdateInput = {
        title,
        content,
    };

    // properly update note checklist items
    if (type === 'CHECKLIST') {
        const listItems = req.body.listItems;

        // set object containing check list items items to delete, update or create
        let listItemsNew: { deleteMany?: any, createMany?: any } = {
            // order of operations matters - delete first all the previous notes items,
            // then add all the items with createMany
            deleteMany: {},
            createMany: {
                data: [...listItems]
            }
        };

        noteUpdateData = {
            ...noteUpdateData,
            listItems: listItemsNew
        }
    }

    try {
        const note: Note = await prisma.note.update({
            data: { ...noteUpdateData },
            where: { id: Number(noteId) }
        });

        // clear cached note data
        deleteCachedNote(noteId);

        res.json(note);
        res.status(200);
        res.end();
    } catch(e) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorUpdateDB,
            message: labels.errorNoteUpdateMissing
        };

        res.status(500).send(errorResp);
    }
}

export const updateNoteItem = async (req: Request<{ noteId: string, checklistId: string}, {}, { isDone: boolean }>, res: Response) => {
    const noteId = Number(req.params.noteId);
    const itemUUID = req.params.checklistId;
    const userId = Number(res.locals.userId);
    const { isDone } = req.body;

    if (Number.isNaN(noteId)) {
        res.status(500).send({
            status: labels.errorUpdateDB,
            message: labels.errorNoteUpdateMissing
        });
    }

    // invalid user
    if (Number.isNaN(userId)) {
        res.status(500).send({
            status: labels.errorUpdateDB,
            message: labels.errorNoteOwner
        });
    }

    // check if user is owner of note and can read it
    // check if user is owner of note and can update it
    const cachedNote = await getCachedNoteOwner(req.params.noteId, res.locals.userId);

    // undefined = error
    if (cachedNote === undefined) {
        // if an error occurs, send generic error message
        res.status(500).send({
            status: labels.errorDefaultDB,
            message: labels.errorDefault
        });
    }

    // if user isn't an owner, send unauthorized error message
    if (cachedNote === null) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorNoteOwner
        };
        res.status(403).send(errorResp);
    }

    // proceed with edit
    try {
        await prisma.noteChecklistItems.update({
            where: {
                id: itemUUID,
                ownerId: noteId
            },
            data: {
                isDone: isDone
            }
        });

        // clear cached note data
        deleteCachedNote(noteId.toString());

        res.status(200).end();
    } catch {
        const errorResp: JSONErrorResponse = {
            status: labels.errorUpdateDB,
            message: labels.errorNoteItemUpdateMissing
        };
        res.status(500).send(errorResp);
    }
}

export const deleteNote = async (req: Request<{ noteId: string }, {}, {}>, res: Response) => {
    const noteId = req.params.noteId;
    const userId = res.locals.userId;

    // if the user is not the owner of the note, will throw an error
    // better not inform of reason for deletion, as it is a more drastic action than editing
    try {
        const note: Note = await prisma.note.delete({
            where: {
                id: Number(noteId),
                // only note owned by user will be deleted
                ownerId: Number(userId)
            }
        });

        // clear cached note
        deleteCachedNote(noteId);

        res.json(note);
        res.status(200);
        res.end();
    } catch (e) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorDeleteDB,
            message: labels.errorNoteDeleteMissing
        };
        res.status(500).send(errorResp);
    }
}