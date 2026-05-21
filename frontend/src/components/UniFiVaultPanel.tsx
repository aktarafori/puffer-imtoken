import { useState, useEffect } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import {
  PufferClientHelpers,
  PufferClient,
  Chain,
  UnifiToken,
  Token,
} from '@pufferfinance/puffer-sdk';
import tcx from '@imtoken/tcx-wasm';

export default function UniFiVaultPanel() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [unifiBalance, setUnifiBalance] = useState('0.0000');

  // Token Core 初始化
  useEffect(() => {
    const initTokenCore = async () => {
      try {
        await tcx.init();
        console.log('✅ Token Core 初始化成功 (UniFi)');
      } catch (err) {
        console.log('Token Core 初始化:', err);
      }
    };
    initTokenCore();
  }, []);

  const fetchUnifiBalance = async () => {
    if (!address) return;
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });
      const puffer = new PufferClient(Chain.Mainnet, undefined, publicClient);
      // 示例：查询 unifiETH 余额（根据 SDK 实际方法调整）
      const bal = await puffer.vault.balanceOf(address); // 临时用 pufETH 余额演示，可替换
      setUnifiBalance((Number(bal) / 1e18).toFixed(4));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isConnected && address) fetchUnifiBalance();
  }, [isConnected, address]);

  const handleDepositToUniFi = async () => {
    if (!isConnected || !walletClient || !address) {
      alert('请用 imToken 连接钱包');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      alert('请输入大于0的数量');
      return;
    }

    setLoading(true);
    try {
      const publicClient = PufferClientHelpers.createPublicClient({
        chain: Chain.Mainnet,
        rpcUrls: ['https://eth.llamarpc.com'],
      });

      const pufferClient = new PufferClient(Chain.Mainnet, walletClient, publicClient);

      // UniFi Vault 存款示例（pufETH → unifiETH）
      const { transact } = await pufferClient.nucleusTeller
        .withToken(UnifiToken.unifiETH)
        .deposit({
          account: address,
          token: Token.WETH,           // 或 Token.pufETH 如果支持
          unifiToken: UnifiToken.unifiETH,
          amount: BigInt(Math.floor(Number(amount) * 1e18)),
          minimumMint: BigInt(0),
          isPreapproved: false,
        });

      const tx = await transact();

      setTxHash(tx);
      alert(`✅ UniFi Vault 存款交易已发送！\n\nTx Hash: ${tx}`);
      setAmount('');
      setTimeout(fetchUnifiBalance, 8000);
    } catch (error: any) {
      console.error(error);
      alert('UniFi 存款失败: ' + (error?.shortMessage || error?.message || '未知错误'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-1">UniFi Vault</h2>
      <p className="text-gray-500 mb-6">把 pufETH 存入 UniFi Vault 赚取更高收益</p>

      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 mb-6">
        <div className="flex justify-between">
          <div>
            <div className="text-sm text-gray-500">你的 UniFi 余额</div>
            <div className="text-3xl font-bold text-green-600">{unifiBalance} unifiETH</div>
          </div>
          <div className="text-right text-sm">
            <div>更高 APY + 积分</div>
          </div>
        </div>
      </div>

      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="输入存入数量 (pufETH)"
        className="w-full px-5 py-5 text-xl border border-gray-200 rounded-3xl focus:border-green-500 mb-6"
        disabled={loading}
      />

      <button
        onClick={handleDepositToUniFi}
        disabled={loading || !amount || !isConnected}
        className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-3xl text-xl font-medium disabled:opacity-50"
      >
        {loading ? '交易发送中...' : '一键存入 UniFi Vault'}
      </button>

      {txHash && (
        <p className="mt-4 text-center text-sm break-all text-green-600">
          ✅ Tx: {txHash}
        </p>
      )}

      <p className="text-center text-xs text-gray-400 mt-6">
        已集成 Token Core • UniFi Vault 真实存款
      </p>
    </div>
  );
}
