import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const handleConnect = () => {
    const injectedConnector = connectors.find(c => c.name?.includes('Injected') || c.id === 'injected');
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    } else {
      alert('请在 imToken 或 MetaMask 中打开此页面');
    }
  };

  return (
    <div>
      {isConnected && address ? (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <button 
            onClick={() => disconnect()}
            className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-xs font-medium"
          >
            断开
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className="px-6 py-2 bg-[#007AFF] hover:bg-blue-600 text-white rounded-2xl text-sm font-medium transition-colors"
        >
          连接钱包
        </button>
      )}
    </div>
  );
}
