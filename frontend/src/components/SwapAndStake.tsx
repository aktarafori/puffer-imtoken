import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import tcx from '@imtoken/tcx-wasm';

export default function SwapAndStake() {
  const { isConnected, address } = useAccount();
  const [showIframe, setShowIframe] = useState(false);

  // Token Core 初始化
  useEffect(() => {
    const init = async () => {
      try {
        await tcx.init();
        console.log('✅ Token Core 初始化成功 (Swap)');
      } catch (e) {
        console.log('Token Core:', e);
      }
    };
    init();
  }, []);

  const openEmbeddedSwap = () => {
    if (!isConnected) {
      alert('请先用 imToken 连接钱包');
      return;
    }
    setShowIframe(true);
  };

  return (
    <div className="card p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-2">任意币兑换 + 质押</h2>
      <p className="text-gray-500 mb-6">Tokenlon 聚合最优价格 → 兑换成 pufETH</p>

      {!showIframe ? (
        <>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-3xl p-8 mb-8 text-center">
            <div className="text-6xl mb-4">🔄</div>
            <div className="text-xl font-semibold mb-2">一键任意币兑换</div>
            <div className="text-sm text-gray-600">
              支持 USDT、USDC、DAI、WBTC 等主流代币<br />
              Tokenlon 提供最优汇率 + 低滑点
            </div>
          </div>

          <button
            onClick={openEmbeddedSwap}
            className="w-full py-5 bg-[#FF6B00] hover:bg-orange-600 text-white rounded-3xl text-xl font-medium"
          >
            打开嵌入式 Tokenlon 兑换
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            兑换完成后回到「直接质押」页面即可质押 pufETH
          </p>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium">Tokenlon 兑换器</h3>
            <button
              onClick={() => setShowIframe(false)}
              className="text-sm text-gray-500 hover:text-black"
            >
              ← 返回
            </button>
          </div>

          {/* 完全嵌入式 Iframe */}
          <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white" style={{ height: '560px' }}>
            <iframe
              src={`https://tokenlon.im/instant?from=ETH&to=pufETH&address=${address || ''}`}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Tokenlon Swap"
              allow="ethereum"
            />
          </div>

          <p className="text-center text-xs text-gray-500 mt-4">
            在 iframe 中完成兑换后，关闭此页面返回「直接质押」Tab 即可质押
          </p>
        </div>
      )}
    </div>
  );
}
