export const filterAndSortProducts = (products, { query = '', category = 'all', sort = 'default' } = {}) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filtered = products.filter((product) => {
    const categoryMatch = category === 'all' || product.category === category;
    const searchMatch = !normalizedQuery
      || `${product.title} ${product.description} ${product.category}`.toLocaleLowerCase().includes(normalizedQuery);
    return categoryMatch && searchMatch;
  });

  if (sort === 'default') return filtered;
  const descending = sort === 'price-desc' || sort === 'name-desc';
  const direction = descending ? -1 : 1;
  return [...filtered].sort((first, second) => {
    if (sort === 'price-asc' || sort === 'price-desc') return (first.price - second.price) * direction;
    if (sort === 'name-asc' || sort === 'name-desc') return first.title.localeCompare(second.title) * direction;
    return 0;
  });
};