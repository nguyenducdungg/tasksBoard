'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffectOnce } from '@/hooks';
import { useModal } from '@/hooks/use-modal-store';
import { formatError, type ErrorObject } from '@/lib/utils';
import { useAppSelector } from '@/store/hooks';
import { api } from '@/trpc/react';
import { createBoardSchema, type CreateBoard, type CreateColumn } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ReloadIcon } from '@radix-ui/react-icons';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { RiCloseLine } from 'react-icons/ri';
import ErrorAlert from '../ui/error-response';

const AddNewBoard = () => {
  const router = useRouter();

  const { columns } = useAppSelector((state) => state.GlobalService);

  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === 'addNewBoard';

  const asEdit = (data?.asEdit && isModalOpen) ?? false;

  const boardId = asEdit ? data?.board!.id : '';
  const boardName = asEdit ? data?.board!.name : '';

  const boardColumns = asEdit
    ? columns?.map(({ id, name }: { id: string; name: string }) => ({ id, name, boardId }))
    : [{ name: '' }];

  const form = useForm<CreateBoard>({
    resolver: zodResolver(createBoardSchema),
    // @ts-ignore
    values: { name: boardName, columns: boardColumns }
  });

  const {
    control,
    reset,
    clearErrors,
    formState: { errors }
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'columns'
  });

  const removeColumn = (Idx: number) => {
    remove(Idx);
  };

  const addNewColumn = useCallback(
    (value: CreateColumn) => {
      append(value);
      // clearErrors();
    },
    [errors, append, clearErrors]
  );

  useEffectOnce(() => {
    if (fields.length === 0) {
      addNewColumn({ name: '' });
    }
  });

  const mutateAddBoard = api.board.create.useMutation({
    onSuccess: (data) => {
      form.reset();
      onClose();
      router.push(`/board/${data.data.slug}`);
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    }
  });

  const mutateUpdateBoard = api.board.update.useMutation({
    onSuccess: () => {
      form.reset();
      onClose();
      router.refresh();
    },
    onError: (error) => {
      console.error(error);
    }
  });

  const onSubmit = (data: CreateBoard) => {
    if (asEdit) {
      return mutateUpdateBoard.mutate(data);
    }

    mutateAddBoard.mutate(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isSubmitting = mutateUpdateBoard.isLoading || mutateAddBoard.isLoading;

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black overflow-hidden">
        <DialogHeader className="pt-8">
          <DialogTitle className="text-lg text-black dark:text-white">
            {asEdit ? 'Edit' : 'Add'} New Board
          </DialogTitle>
        </DialogHeader>
        {mutateAddBoard.isError && (
          <ErrorAlert errors={formatError(mutateAddBoard.error?.shape?.data as ErrorObject)} />
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-6">
                  <FormLabel required>Board Name</FormLabel>
                  <FormControl>
                    <Input className="mb-4" placeholder="e.g. Web Design" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormLabel required>Board Columns</FormLabel>
            <div className="flex flex-col gap-3 mt-2">
              {fields.map((column, Idx) => (
                <div key={column.id}>
                  <div className="flex items-center gap-2">
                    <FormField
                      control={control}
                      name={`columns.${Idx}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              defaultValue={column.name}
                              placeholder={`Todo ${Idx + 1}`}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      data-testid={`button.${Idx}`}
                      className="font-bold text-xl h-10 text-brand-regent-grey"
                      size="sm"
                      onClick={() => removeColumn(Idx)}
                      variant="unstyled"
                    >
                      <RiCloseLine size="24px" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button
              type="button"
              className="font-bold w-full my-4"
              variant="secondary"
              onClick={() => addNewColumn({ name: '' })}
              size="lg"
            >
              + Add New Column
            </Button>
            <DialogFooter className="px-6 py-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="default"
                className="font-medium w-full"
                size="lg"
              >
                {isSubmitting && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                {asEdit ? 'Edit Board' : 'Create New Board'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewBoard;
