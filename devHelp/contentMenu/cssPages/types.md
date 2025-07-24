<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Body</title>
	<style>
		body {
			font-family: system-ui;
		}
		.box {
			width: 1px;
			height: 53px;
			background: #374151;
		}
		.box2 {
			height: 1px;
			align-self: stretch;
			background: #374151;
		}
		.box3 {
			width: 224px;
			height: 1px;
			background: #374151;
		}
		.box4 {
			width: 115px;
			height: 50px;
			background: #374151;
		}
		.box5 {
			width: 115px;
			height: 1px;
			background: #374151;
		}
		.column {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 24px;
		}
		.column2 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border-radius: 8px;
			box-shadow: 0px 1px 2px #0000001A;
		}
		.column3 {
			flex: 1;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column4 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
		}
		.column5 {
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
			width: 16px;
			height: 16px;
			object-fit: fill;
		}
		.image2 {
			width: 115px;
			height: 53px;
			object-fit: fill;
		}
		.image3 {
			border-radius: 4px;
			width: 44px;
			height: 33px;
			object-fit: fill;
		}
		.row-view {
			align-self: stretch;
			display: flex;
			align-items: flex-start;
			border-radius: 8px;
			box-shadow: 0px 1px 2px #00000012;
		}
		.row-view2 {
			display: flex;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 12px 89px 12px 16px;
			margin: 16px;
			gap: 10px;
		}
		.row-view3 {
			align-self: stretch;
			display: flex;
			align-items: center;
		}
		.row-view4 {
			align-self: stretch;
			display: flex;
			align-items: center;
			padding: 16px;
		}
		.row-view5 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			border-radius: 4px;
			border: 1px solid #374151;
		}
		.scroll-view {
			height: 874px;
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 40px;
		}
		.text {
			color: #FFFFFF;
			font-size: 30px;
			font-weight: bold;
		}
		.text2 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.text3 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text4 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
			margin-left: 12px;
			margin-right: 12px;
		}
		.text5 {
			color: #FFFFFF;
			font-size: 24px;
			font-weight: bold;
		}
		.text6 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text7 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
			margin-left: 16px;
		}
		.text8 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px;
		}
		.text9 {
			color: #9CA3AF;
			font-size: 12px;
			font-weight: bold;
		}
		.text10 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 195px 16px 16px;
		}
		.text11 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 202px 16px 16px;
			width: 6px;
		}
		.text12 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 194px 16px 16px;
			width: 14px;
		}
		.text13 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 202px 16px 16px;
		}
		.text14 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 93px 16px 16px;
		}
		.text15 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			margin: 16px 93px 16px 16px;
			width: 115px;
		}
		.text16 {
			color: #9CA3AF;
			font-size: 14px;
			flex: 1;
		}
		.view {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			padding: 16px 62px 17px 62px;
		}
		.view2 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #1F2A37;
			padding: 16px 60px 17px 60px;
		}
		.view3 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			padding: 16px 29px;
		}
		.view4 {
			flex: 1;
			display: flex;
			flex-direction: column;
			background: #1F2A37;
			padding: 16px;
			margin-right: 1px;
		}
		.view5 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding-top: 16px;
			padding-bottom: 16px;
		}
		.view6 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 58px 16px 16px;
		}
		.view7 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			padding: 16px 94px 16px 16px;
		}
		.view8 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border: 1px solid #374151;
			padding: 6px 12px;
		}
		.view9 {
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
			<span class="text" >
				Рефинансирование Кредита
			</span>
			<div class="row-view">
				<div class="view">
					<span class="text2" >
						До регистрации
					</span>
				</div>
				<div class="box">
				</div>
				<div class="view2">
					<span class="text3" >
						Личный кабинет
					</span>
				</div>
				<div class="box">
				</div>
				<div class="view3">
					<span class="text3" >
						Админ панель для сайтов
					</span>
				</div>
				<div class="box">
				</div>
				<div class="view4">
					<span class="text4" >
						Админ панель для банков
					</span>
				</div>
				<div class="box">
				</div>
			</div>
			<div class="column">
				<span class="text5" >
					Список страниц
				</span>
				<div class="column2">
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/b2js6c6k_expires_30_days.png" 
							class="image"
						/>
						<span class="text6" >
							Искать по названию, ID, номеру страницы
						</span>
					</div>
					<div class="row-view3">
						<div class="column3">
							<div class="view5">
								<span class="text7" >
									НАЗВАНИЕ СТРАНИЦЫ
								</span>
							</div>
							<div class="box2">
							</div>
							<span class="text8" >
								2.Рефинансирование кредита
							</span>
							<div class="box2">
							</div>
							<span class="text8" >
								2.1 Подтверждение удаления кредита.
							</span>
							<div class="box2">
							</div>
							<span class="text8" >
								4.Анкета личных данных
							</span>
							<div class="box2">
							</div>
							<span class="text8" >
								7.Анкета доходов. Наемный работник
							</span>
							<div class="box2">
							</div>
							<span class="text8" >
								7.1 Добавление источника дохода
							</span>
							<div class="box2">
							</div>
							<span class="text8" >
								7.2 Добавление доп источника дохода
							</span>
							<div class="box2">
							</div>
							<span class="text8" >
								7.3 Добавление долгового обязательства
							</span>
							<div class="box2">
							</div>
							<span class="text8" >
								11 Выбор программ кредита
							</span>
						</div>
						<div class="column4">
							<div class="view6">
								<span class="text9" >
									Количество действии
								</span>
							</div>
							<div class="box3">
							</div>
							<span class="text10" >
								16
							</span>
							<div class="box3">
							</div>
							<span class="text11" >
								3
							</span>
							<div class="box3">
							</div>
							<span class="text12" >
								23
							</span>
							<div class="box3">
							</div>
							<span class="text12" >
								22
							</span>
							<div class="box3">
							</div>
							<span class="text11" >
								9
							</span>
							<div class="box3">
							</div>
							<span class="text13" >
								5
							</span>
							<div class="box3">
							</div>
							<span class="text11" >
								7
							</span>
							<div class="box3">
							</div>
							<span class="text12" >
								10
							</span>
						</div>
						<div class="column4">
							<div class="view7">
								<span class="text9" >
									Были изменения
								</span>
							</div>
							<div class="box3">
							</div>
							<span class="text14" >
								01.08.2023 | 12:03
							</span>
							<div class="box3">
							</div>
							<span class="text15" >
								01.08.2023 | 12:03
							</span>
							<div class="box3">
							</div>
							<span class="text15" >
								01.08.2023 | 12:03
							</span>
							<div class="box3">
							</div>
							<span class="text15" >
								01.08.2023 | 12:03
							</span>
							<div class="box3">
							</div>
							<span class="text15" >
								01.08.2023 | 12:03
							</span>
							<div class="box3">
							</div>
							<span class="text14" >
								01.08.2023 | 12:03
							</span>
							<div class="box3">
							</div>
							<span class="text15" >
								01.08.2023 | 12:03
							</span>
							<div class="box3">
							</div>
							<span class="text15" >
								01.08.2023 | 12:03
							</span>
						</div>
						<div class="column5">
							<div class="box4">
							</div>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/416xrtyk_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/2u3fh8ks_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/p57f56yw_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/yb1ek2k7_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/g809310b_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/8e58j2sb_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/e0drstbw_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/sqev6hb6_expires_30_days.png" 
								class="image2"
							/>
							<div class="box5">
							</div>
							<div class="box5">
							</div>
						</div>
					</div>
					<div class="row-view4">
						<span class="text16" >
							Показывает 1-20 из 1000
						</span>
						<div class="row-view5">
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/c5kqim2k_expires_30_days.png" 
								class="image3"
							/>
							<div class="view8">
								<span class="text3" >
									1
								</span>
							</div>
							<div class="view9">
								<span class="text2" >
									2
								</span>
							</div>
							<div class="view8">
								<span class="text3" >
									3
								</span>
							</div>
							<div class="view8">
								<span class="text3" >
									...
								</span>
							</div>
							<div class="view8">
								<span class="text3" >
									100
								</span>
							</div>
							<img
								src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/98cm5a31_expires_30_days.png" 
								class="image3"
							/>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>