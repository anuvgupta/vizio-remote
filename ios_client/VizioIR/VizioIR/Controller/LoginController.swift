//
//  LoginController.swift
//  VizioIR
//
//  Created by Anuv Gupta on 9/5/19.
//  Copyright © 2019 Anuv Gupta. All rights reserved.
//

import UIKit
import Foundation

class LoginController: UIViewController {
    
    override var preferredStatusBarStyle: UIStatusBarStyle {
        return .lightContent
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        bridge.loginVC = self
        ws.connect()
    }
    
}

