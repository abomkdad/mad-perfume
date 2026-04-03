export default async function handler(req, res) {
  const CATALOG_URL = 'https://www.mad-parfumeur.com/catalog.json';
  
  try {
    const code = (req.query.code || '').trim().toLowerCase();
    const search = (req.query.search || '').trim().toLowerCase();

    if (!code && !search) {
        return res.status(400).json({ error: 'code or search is required' });
    }

    const response = await fetch(CATALOG_URL);
    const data = await response.json();

    let found = null;
    for (const item of data) {
        const pCode = (item.perfume_code || '').toLowerCase();
        const pTitle = (item.real_title || '').toLowerCase();

        if (code && pCode === code) {
            found = item;
            break;
        }

        if (search && pTitle.includes(search)) {
            found = item;
            break;
        }
    }

    if (!found) {
        return res.status(404).json({ error: 'product not found' });
    }

    // إرجاع بيانات العطر
    return res.status(200).json(found);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
