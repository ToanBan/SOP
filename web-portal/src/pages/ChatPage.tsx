const ChatPage = () => {
	return (
		<div className="flex h-full overflow-hidden">
			{/* List Converstations */}
			<div className="w-80 bg-white border-r border-slate-200 flex flex-col">
				<div className="p-4 border-b border-slate-100">
					<input
						type="text"
						placeholder="Tìm khách hàng..."
						className="w-full bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-100"
					/>
				</div>
				<div className="flex-1 overflow-y-auto">
					{[
						{
							name: "Nguyễn Văn A",
							platform: "Messenger",
							msg: "Shop ơi tư vấn mình...",
							time: "2p",
							unread: true,
						},
						{
							name: "Trần Thị B",
							platform: "Zalo",
							msg: "Đã nhận hàng ạ!",
							time: "1h",
							unread: false,
						},
						{
							name: "Dev Team",
							platform: "Telegram",
							msg: "Check log hệ thống",
							time: "5h",
							unread: false,
						},
					].map((chat, i) => (
						<div
							key={i}
							className={`p-4 flex gap-3 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${chat.unread ? "bg-indigo-50/30" : ""}`}
						>
							<div className="relative">
								<div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold">
									{chat.name[0]}
								</div>
								<span className="absolute -bottom-1 -right-1 text-xs">
									{chat.platform === "Messenger"
										? "🔵"
										: chat.platform === "Zalo"
											? "🔵"
											: "✈️"}
								</span>
							</div>
							<div className="flex-1 overflow-hidden">
								<div className="flex justify-between items-baseline">
									<h4 className="font-bold text-sm truncate">{chat.name}</h4>
									<span className="text-[10px] text-slate-400">
										{chat.time}
									</span>
								</div>
								<p className="text-xs text-slate-500 truncate">{chat.msg}</p>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Main Chat Content */}
			<div className="flex-1 flex flex-col bg-white">
				<div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
					<div className="flex items-center gap-3">
						<h3 className="font-bold">Nguyễn Văn A</h3>
						<span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 text-[10px] font-bold">
							Facebook Messenger
						</span>
					</div>
					<button className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-100">
						+ Chốt đơn nhanh
					</button>
				</div>

				{/* Message Area */}
				<div className="flex-1 p-6 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/50">
					{/* Message bubbles would go here */}
					<div className="space-y-4">
						<div className="flex justify-start">
							<div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm max-w-md text-sm">
								Chào shop, mình muốn hỏi về NestJS
							</div>
						</div>
						<div className="flex justify-end">
							<div className="bg-indigo-600 text-white p-3 rounded-2xl rounded-tr-none shadow-md max-w-md text-sm">
								Dạ chào bạn, khóa học NestJS hiện đang giảm giá 20% ạ!
							</div>
						</div>
					</div>
				</div>

				{/* Chat Input */}
				<div className="p-4 border-t border-slate-200">
					<div className="flex gap-2 bg-slate-100 p-2 rounded-2xl">
						<input
							type="text"
							placeholder="Nhập tin nhắn..."
							className="flex-1 bg-transparent border-none focus:ring-0 px-2"
						/>
						<button className="p-2 bg-indigo-600 text-white rounded-xl shadow-md">
							🚀
						</button>
					</div>
				</div>
			</div>

			{/* Customer Info Sidebar */}
			<div className="w-72 bg-white border-l border-slate-200 p-6 hidden xl:block">
				<h3 className="font-bold mb-6">Thông tin khách hàng</h3>
				<div className="space-y-6">
					<div className="text-center">
						<div className="w-20 h-20 bg-indigo-100 rounded-3xl mx-auto mb-3 flex items-center justify-center text-2xl font-black text-indigo-600">
							NA
						</div>
						<p className="font-bold">Nguyễn Văn A</p>
						<p className="text-xs text-slate-400">Đã mua 3 đơn hàng</p>
					</div>
					<div className="space-y-3">
						<div className="p-3 bg-slate-50 rounded-xl">
							<p className="text-[10px] text-slate-400 font-bold uppercase">
								SĐT
							</p>
							<p className="text-sm font-semibold">090xxxx123</p>
						</div>
						<div className="p-3 bg-slate-50 rounded-xl">
							<p className="text-[10px] text-slate-400 font-bold uppercase">
								Địa chỉ
							</p>
							<p className="text-sm font-semibold">Quận 9, TP. HCM</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ChatPage;
