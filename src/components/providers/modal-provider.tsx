'use client';

import { useEffect, useState } from 'react';

import AddNewBoard from '../modals/add-new-board';
import AddNewColumnModal from '../modals/add-new-column';
import AddNewTaskModal from '../modals/add-new-task';
import DeleteBoard from '../modals/delete-board';
import DeleteTask from '../modals/delete-task';
import ViewTask from '../modals/view-task';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AddNewBoard />
      <AddNewColumnModal />
      <AddNewTaskModal />
      <ViewTask />
      <DeleteTask />
      <DeleteBoard />
    </>
  );
};
