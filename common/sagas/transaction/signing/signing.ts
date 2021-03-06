import { SagaIterator } from 'redux-saga';
import { put, apply, take, takeEvery, call, select } from 'redux-saga/effects';
import { IFullWalletAndTransaction, signTransactionWrapper } from './helpers';
import { transactionToRLP, signTransactionWithSignature } from 'utils/helpers';
import {
  signLocalTransactionSucceeded,
  signWeb3TransactionSucceeded,
  TypeKeys,
  resetTransactionRequested,
  SignWeb3TransactionSucceededAction,
  SignLocalTransactionSucceededAction,
  SignTransactionRequestedAction
} from 'actions/transaction';
import { computeIndexingHash } from 'libs/transaction';
import { serializedAndTransactionFieldsMatch } from 'selectors/transaction';
import { showNotification } from 'actions/notifications';
import {
  requestTransactionSignature,
  FinalizeSignatureAction,
  TypeKeys as ParityKeys
} from 'actions/paritySigner';
import { getWalletType, IWalletType } from 'selectors/wallet';

export function* signLocalTransactionHandler({
  tx,
  wallet
}: IFullWalletAndTransaction): SagaIterator {
  const signedTransaction: Buffer = yield apply(wallet, wallet.signRawTransaction, [tx]);
  const indexingHash: string = yield call(computeIndexingHash, signedTransaction);
  yield put(
    signLocalTransactionSucceeded({
      signedTransaction,
      indexingHash,
      noVerify: true
    })
  );
}

const signLocalTransaction = signTransactionWrapper(signLocalTransactionHandler);

export function* signWeb3TransactionHandler({ tx }: IFullWalletAndTransaction): SagaIterator {
  const serializedTransaction: Buffer = yield apply(tx, tx.serialize);
  const indexingHash: string = yield call(computeIndexingHash, serializedTransaction);

  yield put(
    signWeb3TransactionSucceeded({
      transaction: serializedTransaction,
      indexingHash
    })
  );
}

const signWeb3Transaction = signTransactionWrapper(signWeb3TransactionHandler);

export function* signParitySignerTransactionHandler({
  tx,
  wallet
}: IFullWalletAndTransaction): SagaIterator {
  const from = yield apply(wallet, wallet.getAddressString);
  const rlp = yield call(transactionToRLP, tx);

  yield put(requestTransactionSignature(from, rlp));

  const { payload }: FinalizeSignatureAction = yield take(
    ParityKeys.PARITY_SIGNER_FINALIZE_SIGNATURE
  );
  const signedTransaction: Buffer = yield call(signTransactionWithSignature, tx, payload);
  const indexingHash: string = yield call(computeIndexingHash, signedTransaction);

  yield put(signLocalTransactionSucceeded({ signedTransaction, indexingHash, noVerify: false }));
}

const signParitySignerTransaction = signTransactionWrapper(signParitySignerTransactionHandler);

/**
 * @description Verifies that the transaction matches the fields, and if its a locally signed transaction (so it has a signature) it will verify the signature too
 * @param {(SignWeb3TransactionSucceededAction | SignLocalTransactionSucceededAction)} {
 *   type
 * }
 * @returns {SagaIterator}
 */
function* verifyTransaction({
  type,
  payload: { noVerify }
}: SignWeb3TransactionSucceededAction | SignLocalTransactionSucceededAction): SagaIterator {
  if (noVerify) {
    return;
  }
  const transactionsMatch: boolean = yield select(
    serializedAndTransactionFieldsMatch,
    type === TypeKeys.SIGN_LOCAL_TRANSACTION_SUCCEEDED,
    noVerify
  );
  if (!transactionsMatch) {
    yield put(
      showNotification('danger', 'Something went wrong signing your transaction, please try again')
    );
    yield put(resetTransactionRequested());
  }
}

function* handleTransactionRequest(action: SignTransactionRequestedAction): SagaIterator {
  const walletType: IWalletType = yield select(getWalletType);

  const signingHandler = walletType.isWeb3Wallet
    ? signWeb3Transaction
    : walletType.isParitySignerWallet ? signParitySignerTransaction : signLocalTransaction;

  return yield call(signingHandler, action);
}

export const signing = [
  takeEvery(TypeKeys.SIGN_TRANSACTION_REQUESTED, handleTransactionRequest),
  takeEvery(
    [TypeKeys.SIGN_LOCAL_TRANSACTION_SUCCEEDED, TypeKeys.SIGN_WEB3_TRANSACTION_SUCCEEDED],
    verifyTransaction
  )
];
