export type DocModel = {
  id: string;
};

export type DocViewModel<T extends DocModel> = Omit<T, 'id'> & {
  id?: string;
};

export type DocApiModel<T extends DocModel> = Omit<T, 'id'>;
