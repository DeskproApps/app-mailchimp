
import { wait } from './wait'

/**
 * @see http://developer.mailchimp.com/documentation/mailchimp/reference/batches/#create-post_batches
 */
export class BatchOperation
{
  constructor({ method, path, params, body, operation_id })
  {
    this.props = { method, path, params, body, operation_id };
  }

  toJS = () => {  return { ...this.props }; }
}

export class BatchOperationListBuilder
{
  constructor()
  {
    this.state = { operations: []};
  }

  /**
   * @param path
   * @param params
   * @param operation_id
   * @return {BatchOperationListBuilder}
   */
  addGet = ({path, params, operation_id}) => {
    const operation = new BatchOperation({method: 'GET', path, params, operation_id});
    this.state.operations.push(operation.toJS());

    return this;
  };

  /**
   * @param path
   * @param body
   * @param operation_id
   * @return {BatchOperationListBuilder}
   */
  addPost = ({path, body, operation_id}) => {
    const operation = new BatchOperation({method: 'POST', path, body, operation_id});
    this.state.operations.push(operation.toJS());

    return this;
  };

  /**
   * @param path
   * @param body
   * @param operation_id
   * @return {BatchOperationListBuilder}
   */
  addPut = ({path, body, operation_id}) => {
    const operation = new BatchOperation({method: 'PUT', path, body, operation_id});
    this.state.operations.push(operation.toJS());

    return this;
  };

  /**
   * @param path
   * @param body
   * @param operation_id
   * @return {BatchOperationListBuilder}
   */
  addPatch = ({path, body, operation_id}) => {
    const operation = new BatchOperation({method: 'PATCH', path, body, operation_id});
    this.state.operations.push(operation.toJS());

    return this;
  };

  /**
   * @return {String}
   */
  toJSON = () => JSON.stringify(this.state.operations);

  /**
   * @return {String}
   */
  toRequestJSON = () => JSON.stringify({ operations: this.state.operations });
}

export class Client
{
  /**
   * @param {FetchClient} fetchClient
   */
  constructor({ fetchClient })
  {
    this.props = { fetchClient };
  }

  /**
   * @return {BatchOperationListBuilder}
   */
  operations = () => new BatchOperationListBuilder();

  /**
   * @param {String} endpoint
   * @param init
   * @return {Promise.<TResult>|*}
   */
  fetch (endpoint, init) {

    const { fetchClient } = this.props;
    const { method, wait } = init

    if (method.toString().toLowerCase() === 'post' && wait) {
      return fetchClient.fetch(endpoint, init)
        .then(response => {
          const { id: batchId } = response.body;
          return waitForBatchstatus({ fetchClient, batchId, interval: 500 });
        })
        .then(response => {
          console.log('got body url', response.body.response_body_url, response);
          return response;
        })
        .catch(e => {console.log(e)})
      ;
    }

    return fetchClient.fetch(endpoint, init);
  }
}

const waitForBatchstatus = ({ fetchClient, batchId, interval }) => {
    const boundGetBatchResponse = getBatchResponse.bind(null, { fetchClient, batchId});

    const stop = response => response.body.response_body_url.length !== 0;
    const next = iteration => result => iteration(result, iteration);

    const iteration = (result, nextIteration) => wait (boundGetBatchResponse, interval, stop, next(nextIteration));
    return wait (boundGetBatchResponse, interval, stop, next(iteration));
};

/**
 * @param {FetchClient} fetchClient
 * @param batchId
 */
const getBatchResponse = ({ fetchClient, batchId }) => fetchClient.fetch(`/batches/${batchId}`, { method: 'GET' })
;