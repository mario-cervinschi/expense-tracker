import Router from 'koa-router';
import dataStore from 'nedb-promise';
import { broadcast } from './wss.js';

export class ItemStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }

  async find(props) {
    return this.store.find(props);
  }

  async findOne(props) {
    return this.store.findOne(props);
  }

  async insert(item) {
    return this.store.insert(item);
  };

  async update(props, item) {
    return this.store.update(props, item);
  }

  async remove(props) {
    return this.store.remove(props);
  }
}

const itemStore = new ItemStore({ filename: './db/items.json', autoload: true });

export const itemRouter = new Router();

itemRouter.get('/', async (ctx) => {
  const userId = ctx.state.user._id;
  const { page, limit } = ctx.request.query;
  
  const allItems = await itemStore.find({ userId });
  
  if (page !== undefined && limit !== undefined) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedItems = allItems.slice(startIndex, endIndex);
    
    ctx.response.body = {
      data: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: allItems.length,
        totalPages: Math.ceil(allItems.length / limitNum)
      }
    };
  } else {
    ctx.response.body = allItems;
  }
  
  ctx.response.status = 200;
});

itemRouter.get('/filter/:searchTerm', async (ctx) => {
  const userId = ctx.state.user._id;
  const { searchTerm } = ctx.params;
  const { page, limit } = ctx.request.query;
  
  const allItems = await itemStore.find({ userId });
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  const filteredItems = allItems.filter(item => {
    const titleMatch = item.title && item.title.toLowerCase().includes(lowerCaseSearchTerm);
    
    const dateMatch = item.date && item.date.includes(lowerCaseSearchTerm);
    
    return titleMatch || dateMatch;
  });
  
  if (page !== undefined && limit !== undefined) {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    ctx.response.body = {
      data: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limitNum)
      }
    };
  } else {
    ctx.response.body = filteredItems;
  }
  
  ctx.response.status = 200;
});

itemRouter.get('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const item = await noteStore.findOne({ _id: ctx.params.id });
  const response = ctx.response;
  if (item) {
    if (item.userId === userId) {
      ctx.response.body = item;
      ctx.response.status = 200; // ok
    } else {
      ctx.response.status = 403; // forbidden
    }
  } else {
    ctx.response.status = 404; // not found
  }
});

const createItem = async (ctx, item, response) => {
  try {
    const userId = ctx.state.user._id;
    item.userId = userId;

    delete item._id;
    const insertedItem = await itemStore.insert(item);
    
    response.body = insertedItem;
    response.status = 201; // created
    broadcast(userId, { type: 'created', payload: insertedItem });
  } catch (err) {
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

itemRouter.post('/', async ctx => await createItem(ctx, ctx.request.body, ctx.response));

itemRouter.put('/:id', async ctx => {
  const item = ctx.request.body;
  const id = ctx.params.id;
  const itemId = item._id;
  const response = ctx.response;
  if (itemId && itemId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!itemId) {
    await createItem(ctx, item, response);
  } else {
    const userId = ctx.state.user._id;
    item.userId = userId;
    const updatedCount = await itemStore.update({ _id: id }, item);
    if (updatedCount === 1) {
      response.body = item;
      response.status = 200; // ok
      broadcast(userId, { type: 'updated', payload: item });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

itemRouter.del('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const item = await itemStore.findOne({ _id: ctx.params.id });
  if (item && userId !== item.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    await itemStore.remove({ _id: ctx.params.id });
    ctx.response.status = 204; // no content
  }
});
