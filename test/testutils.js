["return",["begin!",
    ["var",["metaConvertVar!","module"]],
    ["=", ["metaConvertVar!","module"],
        ["call!",["|->", [undefined],
            ["begin!",
                ["=", ["jsvar!","exports"],
                    ["hash!"]],
                ["index!",["jsvar!","__tjExp"],0],
                ["return",["jsvar!","exports"]]]]
            [undefined]]],
    ["var",["metaConvertVar!","name"]],
    ["forOf!",["metaConvertVar!","name"],["metaConvertVar!","module"]
        ["if", ["call!",["attribute!","__hasProp","call"]
        [["metaConvertVar!","name"]]],
        ["=", ["metaConvertVar!","name"],
            ["index!",["metaConvertVar!","module"],["metaConvertVar!","name"]]]]],
    ["index!",["jsvar!","__tjExp"],1]]]