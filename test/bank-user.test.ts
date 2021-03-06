import * as nock from 'nock';

import { RequestBuilder } from '../src/RequestBuilder';
import { BanksUser } from '../src/core/BanksUser';
import { BanksUserStatus } from '../src/lib';
import { getFakeAlgoanServer, getOAuthServer } from './utils/fake-server.utils';
import {
  banksUser as banksUserSample,
  banksUserAccount as banksUserAccountSample,
  banksUserTransaction as banksUserTransactionSample,
  banksUserTransactionResponse as banksUserTransactionResponseSample,
} from './samples/banks-users';

describe('Tests related to the BanksUser class', () => {
  const baseUrl: string = 'http://localhost:3000';
  let banksUserAPI: nock.Scope;
  let requestBuilder: RequestBuilder;

  beforeEach(() => {
    getOAuthServer({
      baseUrl,
      isRefreshToken: false,
      isUserPassword: false,
      nbOfCalls: 1,
      expiresIn: 500,
      refreshExpiresIn: 2000,
    });
    requestBuilder = new RequestBuilder(baseUrl, {
      clientId: 'a',
      clientSecret: 's',
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    nock.cleanAll();
  });

  describe('static getBanksUserById()', () => {
    beforeEach(() => {
      banksUserAPI = getFakeAlgoanServer({
        baseUrl,
        path: '/v1/banks-users/id1',
        response: banksUserSample,
        method: 'get',
      });
    });
    it('should get the Banks User account', async () => {
      const banksUser: BanksUser = await BanksUser.getBanksUserById('id1', requestBuilder);
      expect(banksUserAPI.isDone()).toBeTruthy();
      expect(banksUser).toBeInstanceOf(BanksUser);
    });
  });

  describe('update()', () => {
    beforeEach(() => {
      banksUserAPI = getFakeAlgoanServer({
        baseUrl,
        path: '/v1/banks-users/id1',
        response: banksUserSample,
        method: 'patch',
      });
    });
    it('should update the BanksUser', async () => {
      const banksUser: BanksUser = new BanksUser(banksUserSample, requestBuilder);
      banksUser.status = BanksUserStatus.NEW;

      await banksUser.update({
        status: BanksUserStatus.FINISHED,
      });

      expect(banksUserAPI.isDone()).toBeTruthy();
      expect(banksUser.status).toEqual('FINISHED');
    });
  });

  describe('createAccounts()', () => {
    beforeEach(() => {
      banksUserAPI = getFakeAlgoanServer({
        baseUrl,
        path: '/v1/banks-users/id1/accounts',
        response: banksUserAccountSample,
        method: 'post',
      });
    });
    it('should create accounts on the BanksUser', async () => {
      const banksUser: BanksUser = new BanksUser(banksUserSample, requestBuilder);

      await banksUser.createAccounts([banksUserAccountSample]);

      expect(banksUserAPI.isDone()).toBeTruthy();
    });
  });

  describe('createTransactions()', () => {
    beforeEach(() => {
      banksUserAPI = getFakeAlgoanServer({
        baseUrl,
        path: '/v1/banks-users/id1/accounts/accountId1/transactions',
        response: banksUserTransactionResponseSample,
        method: 'post',
      });
    });
    it('should create accounts on the BanksUser', async () => {
      const banksUser: BanksUser = new BanksUser(banksUserSample, requestBuilder);

      await banksUser.createTransactions('accountId1', [banksUserTransactionSample]);

      expect(banksUserAPI.isDone()).toBeTruthy();
    });
  });
});
