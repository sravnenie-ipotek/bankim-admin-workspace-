<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Page</title>
	<style>
		body {
			font-family: system-ui;
		}
		.absolute-image {
			position: absolute;
			bottom: 0px;
			left: 20px;
			width: 24px;
			height: 24px;
			object-fit: fill;
		}
		.absolute-text {
			position: absolute;
			bottom: 0px;
			left: 56px;
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
		}
		.box {
			width: 264px;
			height: 1px;
			background: #374151;
		}
		.box2 {
			width: 1px;
			height: 618px;
			background: #374151;
		}
		.box3 {
			height: 1px;
			align-self: stretch;
			background: #374151;
		}
		.box4 {
			width: 224px;
			height: 1px;
			background: #374151;
		}
		.box5 {
			width: 115px;
			height: 50px;
			background: #374151;
		}
		.box6 {
			width: 115px;
			height: 1px;
			background: #374151;
		}
		.column {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column2 {
			flex: 1;
			display: flex;
			flex-direction: column;
			margin-bottom: 51px;
			gap: 40px;
		}
		.column3 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-left: 105px;
			margin-right: 105px;
			gap: 40px;
		}
		.column4 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 24px;
		}
		.column5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border-radius: 8px;
			box-shadow: 0px 1px 2px #0000001A;
		}
		.column6 {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column7 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.contain {
			display: flex;
			flex-direction: column;
			background: #FFFFFF;
		}
		.image {
			width: 264px;
			height: 48px;
			margin-bottom: 40px;
			object-fit: fill;
		}
		.image2 {
			width: 24px;
			height: 24px;
			object-fit: fill;
		}
		.image3 {
			width: 24px;
			height: 24px;
			margin-right: 12px;
			object-fit: fill;
		}
		.image4 {
			width: 28px;
			height: 28px;
			object-fit: fill;
		}
		.image5 {
			width: 40px;
			height: 40px;
			object-fit: fill;
		}
		.image6 {
			width: 32px;
			height: 32px;
			object-fit: fill;
		}
		.image7 {
			width: 16px;
			height: 16px;
			object-fit: fill;
		}
		.image8 {
			width: 115px;
			height: 53px;
			object-fit: fill;
		}
		.image9 {
			border-radius: 4px;
			width: 44px;
			height: 33px;
			object-fit: fill;
		}
		.row-view {
			align-self: stretch;
			display: flex;
			align-items: flex-start;
			position: relative;
		}
		.row-view2 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			background: #1F2A37;
		}
		.row-view3 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view4 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 20px;
			margin-right: 20px;
			gap: 12px;
		}
		.row-view5 {
			display: flex;
			align-items: center;
			margin-bottom: 23px;
			margin-left: 20px;
			margin-right: 20px;
		}
		.row-view6 {
			align-self: stretch;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			background: #1F2A37;
			padding: 24px 40px 24px 667px;
			gap: 32px;
			box-shadow: 0px 2px 4px #0000000D;
		}
		.row-view7 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view8 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.row-view9 {
			display: flex;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 12px 89px 12px 16px;
			margin: 16px;
			gap: 10px;
		}
		.row-view10 {
			align-self: stretch;
			display: flex;
			align-items: flex-start;
		}
		.row-view11 {
			align-self: stretch;
			display: flex;
			align-items: center;
			padding: 16px;
		}
		.row-view12 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			border-radius: 4px;
			border: 1px solid #374151;
		}
		.row-view13 {
			display: flex;
			align-items: flex-start;
			margin-left: 20px;
			gap: 12px;
		}
		.scroll-view {
			height: 678px;
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 24px;
		}
		.text {
			color: #FBE54D;
			font-size: 16px;
			font-weight: bold;
		}
		.text2 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
		}
		.text3 {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
			margin-right: 54px;
		}
		.text4 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
		}
		.text5 {
			color: #FFFFFF;
			font-size: 30px;
			font-weight: bold;
		}
		.text6 {
			color: #FFFFFF;
			font-size: 24px;
			font-weight: bold;
		}
		.text7 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text8 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
			margin-left: 16px;
		}
		.text9 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 16px 17px 16px;
		}
		.text10 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
		}
		.text11 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 194px 16px 16px;
		}
		.text12 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 202px 15px 16px;
			width: 6px;
		}
		.text13 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 93px 16px 16px;
		}
		.text14 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 15px 93px 15px 16px;
			width: 115px;
		}
		.text15 {
			color: #9CA3AF;
			font-size: 14px;
			flex: 1;
		}
		.text16 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text17 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.view {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
		}
		.view2 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding-top: 16px;
			padding-bottom: 16px;
		}
		.view3 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 58px 16px 16px;
		}
		.view4 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 94px 16px 16px;
		}
		.view5 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border: 1px solid #374151;
			padding: 6px 12px;
		}
		.view6 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border: 1px solid #374151;
			padding: 6px 12px;
		}
	</style>
</head>
<body>
		<div class="contain">
		<div class="scroll-view">
			<div class="row-view">
				<div class="row-view2">
					<div class="column">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/jglgoksr_expires_30_days.png" 
							class="image"
						/>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/r98gfkva_expires_30_days.png" 
								class="image2"
							/>
							<span class="text" >
								Главная
							</span>
						</div>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7gklpk4q_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								Пользователи
							</span>
						</div>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/d2xwmr7a_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								Клиенты
							</span>
						</div>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/aiqo332t_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								Предложения
							</span>
						</div>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/h4buz5b8_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								История Действий
							</span>
						</div>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7loxhdpm_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								Банковские программы
							</span>
						</div>
						<div class="row-view4">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/82zmgu0r_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								Создание аудитории
							</span>
						</div>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/j1tj0sge_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								Формула калькулятора
							</span>
						</div>
						<div class="row-view3">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/msogssvp_expires_30_days.png" 
								class="image2"
							/>
							<span class="text2" >
								Чат
							</span>
						</div>
						<div class="row-view5">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/406kvqw0_expires_30_days.png" 
								class="image3"
							/>
							<span class="text3" >
								Контент сайта
							</span>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/0i1fp3xq_expires_30_days.png" 
								class="image4"
							/>
						</div>
						<div class="box">
						</div>
					</div>
					<div class="box2">
					</div>
				</div>
				<div class="column2">
					<div class="row-view6">
						<div class="row-view7">
							<span class="text4" >
								Русский
							</span>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/z2je0qho_expires_30_days.png" 
								class="image2"
							/>
						</div>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/3usd83pj_expires_30_days.png" 
							class="image5"
						/>
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/pxpznepe_expires_30_days.png" 
							class="image5"
						/>
						<div class="row-view8">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/rs0hqbdd_expires_30_days.png" 
								class="image6"
							/>
							<div class="view">
								<span class="text4" >
									Александр пушкин
								</span>
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ui4uba8l_expires_30_days.png" 
								class="image2"
							/>
						</div>
					</div>
					<div class="column3">
						<span class="text5" >
							Главная
						</span>
						<div class="column4">
							<span class="text6" >
								Список страниц
							</span>
							<div class="column5">
								<div class="row-view9">
									<img
										src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/xbnef3qs_expires_30_days.png" 
										class="image7"
									/>
									<span class="text7" >
										Искать по названию, ID, номеру страницы
									</span>
								</div>
								<div class="row-view10">
									<div class="column6">
										<div class="view2">
											<span class="text8" >
												НАЗВАНИЕ СТРАНИЦЫ
											</span>
										</div>
										<div class="box3">
										</div>
										<span class="text9" >
											Главная страница Страница  №1
										</span>
										<div class="box3">
										</div>
										<span class="text9" >
											Калькулятор ипотеки Страница  №2
										</span>
									</div>
									<div class="column">
										<div class="view3">
											<span class="text10" >
												Количество действии
											</span>
										</div>
										<div class="box4">
										</div>
										<span class="text11" >
											34
										</span>
										<div class="box4">
										</div>
										<span class="text12" >
											8
										</span>
									</div>
									<div class="column">
										<div class="view4">
											<span class="text10" >
												Были изменения
											</span>
										</div>
										<div class="box4">
										</div>
										<span class="text13" >
											01.08.2023 | 12:03
										</span>
										<div class="box4">
										</div>
										<span class="text14" >
											01.08.2023 | 12:03
										</span>
									</div>
									<div class="column7">
										<div class="box5">
										</div>
										<div class="box6">
										</div>
										<img
											src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/q6ctdmef_expires_30_days.png" 
											class="image8"
										/>
										<div class="box6">
										</div>
										<img
											src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/c91qzpjz_expires_30_days.png" 
											class="image8"
										/>
									</div>
								</div>
								<div class="row-view11">
									<span class="text15" >
										Показывает 1-20 из 1000
									</span>
									<div class="row-view12">
										<img
											src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/byoijg2r_expires_30_days.png" 
											class="image9"
										/>
										<div class="view5">
											<span class="text16" >
												1
											</span>
										</div>
										<div class="view6">
											<span class="text17" >
												2
											</span>
										</div>
										<div class="view5">
											<span class="text16" >
												3
											</span>
										</div>
										<div class="view5">
											<span class="text16" >
												...
											</span>
										</div>
										<div class="view5">
											<span class="text16" >
												100
											</span>
										</div>
										<img
											src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/pxea8u1p_expires_30_days.png" 
											class="image9"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/lpohdjwk_expires_30_days.png" 
					class="absolute-image"
				/>
				<span class="absolute-text" >
					Настройки
				</span>
			</div>
			<div class="row-view13">
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/7z61s85h_expires_30_days.png" 
					class="image2"
				/>
				<span class="text2" >
					Выйти
				</span>
			</div>
		</div>
	</div>
</body>
</html>