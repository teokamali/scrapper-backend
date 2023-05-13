const paginate = (array) => {
  return (page, limit) => {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = array.slice(startIndex, endIndex);
    const totalPages = Math.ceil(array.length / limit);
    const totalResults = array.length;

    return {
      results,
      page: +page,
      limit: +limit,
      totalPages,
      totalResults,
    };
  };
};

module.exports = paginate;
