<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Контентстраницы№4.2Text|Default|RU</title>
	<style>
		body {
			font-family: system-ui;
		}
		.box {
			width: 264px;
			height: 1px;
			background: #374151;
			margin-bottom: 24px;
		}
		.box2 {
			width: 1px;
			height: 1188px;
			background: #374151;
		}
		.box3 {
			width: 225px;
			height: 41px;
		}
		.button {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: none;
			border-radius: 8px;
			border: 1px solid #9CA3AF;
			padding: 10px 92px;
			text-align: left;
		}
		.button2 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #FBE54D;
			border-radius: 8px;
			border: none;
			padding: 10px 23px;
			text-align: left;
		}
		.column {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #111928;
		}
		.column2 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding-bottom: 858px;
		}
		.column3 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 32px;
			margin-left: 370px;
			margin-right: 145px;
			gap: 16px;
		}
		.column4 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #1F2A37;
			border-radius: 8px;
			padding: 24px 89px 24px 24px;
			margin-bottom: 32px;
			margin-left: 370px;
			gap: 12px;
		}
		.column5 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-left: 370px;
			gap: 8px;
		}
		.column6 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			margin-bottom: 40px;
			margin-left: 688px;
			margin-right: 463px;
			gap: 8px;
		}
		.column7 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			margin-bottom: 40px;
			margin-left: 370px;
			margin-right: 323px;
			gap: 24px;
		}
		.column8 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			gap: 8px;
		}
		.column9 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 8px;
		}
		.contain {
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
			width: 40px;
			height: 40px;
			object-fit: fill;
		}
		.image4 {
			width: 32px;
			height: 32px;
			object-fit: fill;
		}
		.image5 {
			border-radius: 6px;
			width: 20px;
			height: 20px;
			object-fit: fill;
		}
		.row-view {
			display: flex;
			align-items: flex-start;
			background: #1F2A37;
		}
		.row-view2 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 24px;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view3 {
			display: flex;
			align-items: flex-start;
			margin-bottom: 23px;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view4 {
			display: flex;
			align-items: flex-start;
			margin-left: 20px;
			gap: 12px;
		}
		.row-view5 {
			align-self: stretch;
			display: flex;
			justify-content: flex-end;
			align-items: center;
			background: #1F2A37;
			padding: 24px 40px 24px 667px;
			margin-bottom: 51px;
			margin-left: 265px;
			gap: 32px;
			box-shadow: 0px 2px 4px #0000000D;
		}
		.row-view6 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view7 {
			flex-shrink: 0;
			display: flex;
			align-items: center;
			gap: 12px;
		}
		.row-view8 {
			display: flex;
			align-items: center;
			border-radius: 6px;
			gap: 16px;
		}
		.row-view9 {
			align-self: stretch;
			display: flex;
			align-items: center;
			gap: 15px;
		}
		.row-view10 {
			align-self: stretch;
			display: flex;
			justify-content: space-between;
			align-items: center;
		}
		.row-view11 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			gap: 20px;
		}
		.row-view12 {
			width: 885px;
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
		}
		.row-view13 {
			flex-shrink: 0;
			display: flex;
			align-items: flex-start;
			gap: 16px;
		}
		.text {
			color: #FFFFFF;
			font-size: 16px;
			font-weight: bold;
		}
		.text2 {
			color: #FBE54D;
			font-size: 16px;
			font-weight: bold;
		}
		.text3 {
			color: #F9FAFB;
			font-size: 14px;
			font-weight: bold;
		}
		.text4 {
			color: #9CA3AF;
			font-size: 14px;
			font-weight: bold;
		}
		.text5 {
			color: #F9FAFB;
			font-size: 30px;
			font-weight: bold;
		}
		.text6 {
			color: #9CA3AF;
			font-size: 14px;
		}
		.text7 {
			color: #F9FAFB;
			font-size: 18px;
			font-weight: bold;
		}
		.text8 {
			color: #F9FAFB;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 16px;
			margin-left: 370px;
		}
		.text9 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
		}
		.text10 {
			color: #FFFFFF;
			font-size: 14px;
		}
		.text11 {
			color: #FFFFFF;
			font-size: 14px;
			text-align: right;
		}
		.text12 {
			color: #F9FAFB;
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 32px;
			margin-left: 370px;
		}
		.text13 {
			color: #FFFFFF;
			font-size: 16px;
			width: 257px;
		}
		.text14 {
			color: #FFFFFF;
			font-size: 14px;
			font-weight: bold;
			text-align: right;
			width: 256px;
		}
		.text15 {
			color: #111928;
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
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-bottom: 1px;
		}
		.view3 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 106px 9px 16px;
		}
		.view4 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view5 {
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
		}
		.view6 {
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view7 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 16px 9px 16px;
		}
		.view8 {
			flex-shrink: 0;
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			background: #374151;
			border-radius: 8px;
			border: 1px solid #4B5563;
			padding: 8px 212px 9px 16px;
		}
		.view9 {
			align-self: stretch;
			display: flex;
			flex-direction: column;
			align-items: center;
			background: #1F2A37;
			padding-top: 24px;
			padding-bottom: 24px;
			margin-left: 264px;
			margin-right: 1px;
		}
	</style>
</head>
<body>
		<div class="contain">
		<div class="column">
			<div class="row-view">
				<div class="column2">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/tybq7yql_expires_30_days.png" 
						class="image"
					/>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/cxi0jb42_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Главная
						</span>
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/hyu24dwr_expires_30_days.png" 
							class="image2"
						/>
						<span class="text2" >
							Страницы сайта
						</span>
					</div>
					<div class="row-view3">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/t6pdcesl_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Чат
						</span>
					</div>
					<div class="box">
					</div>
					<div class="row-view2">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/krpzhoor_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Настройки
						</span>
					</div>
					<div class="row-view4">
						<img
							src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/8ax8dhf1_expires_30_days.png" 
							class="image2"
						/>
						<span class="text" >
							Выйти
						</span>
					</div>
				</div>
				<div class="box2">
				</div>
			</div>
			<div class="row-view5">
				<div class="row-view6">
					<span class="text3" >
						Русский
					</span>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/0258pdgd_expires_30_days.png" 
						class="image2"
					/>
				</div>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/1v05s1f1_expires_30_days.png" 
					class="image3"
				/>
				<img
					src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/nr4ir0p3_expires_30_days.png" 
					class="image3"
				/>
				<div class="row-view7">
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/omjwreca_expires_30_days.png" 
						class="image4"
					/>
					<div class="view">
						<span class="text3" >
							Александр пушкин
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/o5qryal3_expires_30_days.png" 
						class="image2"
					/>
				</div>
			</div>
			<div class="column3">
				<div class="row-view8">
					<div class="view2">
						<span class="text4" >
							Страницы сайта
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/aszsxpzj_expires_30_days.png" 
						class="image5"
					/>
					<div class="view2">
						<span class="text4" >
							Главная страница Страница  №1
						</span>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/2cr0deza_expires_30_days.png" 
						class="image5"
					/>
					<div class="view2">
						<span class="text4" >
							Действие №3
						</span>
					</div>
				</div>
				<div class="row-view9">
					<span class="text5" >
						Номер дейcтвия №3 | Основной источник дохода
					</span>
					<div class="view2">
						<span class="text6" >
							Home_page
						</span>
					</div>
				</div>
			</div>
			<div class="column4">
				<span class="text6" >
					Последнее редактирование
				</span>
				<span class="text7" >
					01.08.2023 | 12:03
				</span>
			</div>
			<span class="text8" >
				Заголовки действия
			</span>
			<div class="column5">
				<span class="text9" >
					RU
				</span>
				<div class="view3">
					<span class="text10" >
						Основой источник дохода
					</span>
				</div>
			</div>
			<div class="column6">
				<span class="text9" >
					HEB
				</span>
				<div class="view4">
					<span class="text11" >
						מקור הכנסה עיקרי
					</span>
				</div>
			</div>
			<span class="text12" >
				Дополнительный  текст
			</span>
			<div class="column7">
				<div class="row-view10">
					<span class="text" >
						1
					</span>
					<div class="row-view11">
						<div class="column8">
							<span class="text9" >
								RU
							</span>
							<div class="view5">
								<span class="text10" >
									Cотрудник
								</span>
							</div>
						</div>
						<div class="column9">
							<span class="text9" >
								HEB
							</span>
							<div class="view6">
								<span class="text10" >
									עוֹבֵד
								</span>
							</div>
						</div>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/ogrslfkv_expires_30_days.png" 
						class="image4"
					/>
				</div>
				<div class="row-view10">
					<span class="text" >
						2
					</span>
					<div class="row-view11">
						<div class="view7">
							<span class="text13" >
								Основная квартира: у заемщика нет квартиры, ставка финансирования\nМаксимум до 75% \n\nАльтернативная квартира: у заемщика есть квартира, которую он обязуется продать в течение двух лет, ставка финансирования\nМаксимум до 70% \n\nДве квартиры и более: у заемщика уже есть две квартиры и более, ставка финансирования квартиры Максимум до 50%
							</span>
						</div>
						<div class="view7">
							<span class="text14" >
								דירה ראשית: ללווה אין שיעור מימון דירה\nמקסימום עד 75%\n\nדירה חלופית: ללווה דירה שהוא מתחייב למכור תוך שנתיים, שיעור המימון\nמקסימום עד 70%\n\nדירה שנייה ומעלה: ללווה כבר יש שיעור מימון דירה עד מקסימום 50%
							</span>
						</div>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/kalm9vbk_expires_30_days.png" 
						class="image4"
					/>
				</div>
				<div class="row-view10">
					<span class="text" >
						3
					</span>
					<div class="row-view11">
						<div class="view8">
							<span class="text10" >
								Cотрудник
							</span>
						</div>
						<div class="view7">
							<span class="text10" >
								עוֹבֵד
							</span>
						</div>
					</div>
					<img
						src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/bJ75Zn4C2U/f4uatip9_expires_30_days.png" 
						class="image4"
					/>
				</div>
			</div>
			<div class="view9">
				<div class="row-view12">
					<div class="box3">
					</div>
					<div class="row-view13">
						<button class="button"
							onclick="alert('Pressed!')"}>
							<span class="text3" >
								Назад
							</span>
						</button>
						<button class="button2"
							onclick="alert('Pressed!')"}>
							<span class="text15" >
								Сохранить и опубликовать
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
</html>