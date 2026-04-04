export const makeQuery = (value) => {
  const query = {
    populate() {
      return query;
    },
    select() {
      return query;
    },
    sort() {
      return query;
    },
    limit() {
      return query;
    },
    lean() {
      return Promise.resolve(value);
    },
    then(resolve, reject) {
      return Promise.resolve(value).then(resolve, reject);
    },
    catch(reject) {
      return Promise.resolve(value).catch(reject);
    },
  };

  return query;
};
