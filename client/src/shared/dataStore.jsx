import { createGlobalState } from 'react-hooks-global-state'
const { setGlobalState, useGlobalState } = createGlobalState({
    connectedAccount: '',
    transactions: [],
    transaction: {
        address: '',
        amount: '',
        remark: '',
    },
    transactionCount: localStorage.getItem('transactionCount'),
})
export { useGlobalState, setGlobalState }