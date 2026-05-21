import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  });
  const { disconnect } = useDisconnect();

  return (
    <div>
      {isConnected ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button 
            onClick={() => disconnect()}
            className="px-4 py-1.5 bg-red-100 text-red-600 rounded-xl text-sm"
          >
            断开
          </button>
        </div>
      ) : (
        <button 
          onClick={() => connect()}
          className="px-6 py-2 bg-[#007AFF] text-white rounded-2xl text-sm font-medium"
        >
          连接钱包
        </button>
      )}
    </div>
  );
}
